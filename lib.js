/* global monaco, jQuery */
(function(NS, $) {

    var RE_JSON_REFERENCE = /\s*"reference"\s*:\s*"([^"]*)"\s*?,?$/;
    var RE_XML_REFERENCE  = /\s*<reference\s+value\s*=\s*"([^"]*)"\s*\/>s*?$/;
    var windowUrlObject   = new URL(location.href);
    var fhirUrlString     = windowUrlObject.searchParams.get("url");
    var fhirUrlObject     = fhirUrlString ? new URL(fhirUrlString) : undefined;

    /**
     * Uses the jQuery Ajax to fetch the given URL but does not even parse it
     * since we only want to use the textContent of the response.
     * @param {String} url
     * @returns {Promise<jQuery.jqXHR>}
     */
    function fetchURL(url) {
        return $.ajax({
            url  : url,
            converters: {
                "* text"   : String,
                "text html": true,
                "text json": String,
                "text xml" : String
            }
        });
    }

    /**
     * Given a loaded jQuery AJAX request, reads the Content-type response
     * header and returns a Monaco language based on that. Supported languages
     * are json and xml. Everything else will default to "text"
     * @param {jQuery.XHR} xhr
     * @returns {String}
     */
    function getResponseLanguage(xhr) {
        var type = xhr.getResponseHeader("Content-type");
        if (type.indexOf("application/fhir+json") === 0) {
            return "json";
        }
        if (type.indexOf("application/json") === 0) {
            return "json";
        }
        if (type.indexOf("application/fhir+xml") === 0) {
            return "xml";
        }
        if (type.indexOf("application/xml") === 0) {
            return "xml";
        }
        return "text";
    }

    /**
     * Given a current language creates and returns an object that has two
     * provider methods - one for the mouse-over references preview widget
     * and one that will turn references into links
     * @param {String} lang Should be "json" or "xml"
     */
    function createReferenceProvider(lang) {
        return {
            provideLinks: function(model) {
                var re = lang == "json" ? RE_JSON_REFERENCE : RE_XML_REFERENCE;
                var strRe = String(re);
                strRe = strRe.substring(1, strRe.length - 1); // Remove the regex slashes
                return model.findMatches(strRe, false, true, true, false, true).map(function(res) {
                    var url = new URL(res.matches[1], fhirUrlObject?.origin)
                    if (lang == "json") {
                        url.searchParams.set("_format", "json")
                    }
                    else if (lang == "xml") {
                        url.searchParams.set("_format", "xml")
                    }

                    var lineText = model.getValueInRange(res.range);
                    var match = lineText.match(re);

                    var returnUrl = new URL(windowUrlObject)
                    returnUrl.searchParams.set("url", url.href)

                    return {
                        range: {
                            startLineNumber: res.range.startLineNumber,
                            endLineNumber  : res.range.endLineNumber,
                            endColumn      : match[0].indexOf(match[1]) + match[1].length + 1,
                            startColumn    : match[0].indexOf(match[1]) + 1
                        },
                        url: returnUrl.href
                    };
                })
            },
            provideHover: function(model, position) {
                var re = lang == "json" ? RE_JSON_REFERENCE : RE_XML_REFERENCE;
                var range = new monaco.Range(
                    position.lineNumber,
                    1,
                    position.lineNumber,
                    model.getLineMaxColumn(position.lineNumber)
                );
                var lineText = model.getValueInRange(range);
                var match = lineText.match(re);

                if (!match) {
                    return null;
                }

                var url = new URL(match[1], fhirUrlObject?.origin)
                if (lang == "json") {
                    url.searchParams.set("_format", "json")
                }
                else if (lang == "xml") {
                    url.searchParams.set("_format", "xml")
                }

                return fetchURL(url.href)
                .then(function(data, textStatus, xhr) {
                    var _lang = getResponseLanguage(xhr);
                    return {
                        range: range,
                        contents: [
                            '**' + match[1] + '**',
                            {
                                language: _lang,
                                value: data
                            }
                        ]
                    };
                })
            }
        }
    }

    /**
     * Creates the Monaco editor
     * @param {Element} container The editor container element
     * @param {jQuery.XHR} xhr The loaded ajax request
     * @param {Function} cb Callback to be called when the editor is ready
     * @returns {void}
     */
    function createEditor(container, xhr, cb) {
        var lang = getResponseLanguage(xhr);
        require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
        require(['vs/editor/editor.main'], function() {
            var model = monaco.editor.createModel(xhr.responseText, lang);
            var editor = monaco.editor.create(container, {
                model: model,
                automaticLayout: true,
                emptySelectionClipboard: false,
                folding: true,
                fontFamily: "Menlo, monospace",
                fontSize: 13,
                glyphMargin: true,
                lineHeight: 16,
                mouseWheelZoom: true,
                parameterHints: false,
                quickSuggestions: false,
                readOnly: true,
                renderLineHighlight: "all",
                scrollBeyondLastLine: false,
                snippetSuggestions: "none",
                theme: windowUrlObject.searchParams.get("dark") ? "vs-dark" : "vs",
                wrappingColumn: 3000
            });

            if (lang) {
                var provider = createReferenceProvider(lang);
                monaco.languages.registerHoverProvider(lang, provider);
                monaco.languages.registerLinkProvider(lang, provider);
            }

            cb && cb(null, editor);
        });
    }

    /**
     * Initializes the app. Attempts to load the url (from the query string
     * "url" parameter) and if successful, creates an instance of the Monaco
     * editor to render the result.
     * @param {String} containerID The ID of the container element that will
     *                             host the editor.
     * @returns {void}
     * @global
     */
    function init(containerID) {
        var container = document.getElementById(containerID);
        var message = $('<div class="message"/>').appendTo(container);

        var dark = !!windowUrlObject.searchParams.get("dark")

        $("body").toggleClass("dark", dark);
        $("[name=dark]").prop("disabled", !dark);

        if (fhirUrlString) {
            $(".input-wrap input").val(fhirUrlString);

            message.text('Loading...');
            fetchURL(fhirUrlString).then(function(result, code, xhr) {
                createEditor(container, xhr, function() { message.remove(); });
            }, function(xhr) {
                if (xhr.responseJSON || xhr.responseXML) {
                    createEditor(container, xhr, function() { message.remove(); });
                }
                else {
                    var msg = "";
                    if (xhr.status) {
                        msg += xhr.status + " ";
                    }
                    msg += xhr.statusText || "Failed to load URL!"

                    if (msg == "error") {
                        msg = "Failed to load URL!";
                    }
                    message.text(msg);
                    // message.text(xhr.responseText || "Failed to load URL!");
                }
            });
        }
        else {
            message.text('No "url" parameter given!');
        }
    }

    // export the init function as global
    NS.init = init;

})(window, jQuery);
