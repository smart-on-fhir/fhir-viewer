/* global KNOWN_SERVERS */
(function(NS, $) {

    var RE_JSON_REFERENCE = /\s*"reference"\s*:\s*"([^"]*)"\s*?,?$/;
    var RE_XML_REFERENCE  = /\s*<reference\s+value\s*=\s*"([^"]*)"\s*\/>s*?$/;

    // Parse whatever is passed to the app as query string params
    var params = parseQueryString(location.search);

    /**
     * If the app was loaded with an "url" query parameter this function will
     * test if it begins with any of the urls defined in KNOWN_SERVERS. The
     * first match found is returned. Otherwise an empty string is returned.
     * @returns {String} Might be empty!
     */
    function getBaseURL() {
        var url = "";
        if (params.url) {
            KNOWN_SERVERS.some(function(base) {
                var index, length;

                if (base.url instanceof RegExp) {
                    var match = params.url.match(base.url);
                    if (match && match[0]) {
                        index = match.index;
                        length = match[0].length;
                    }
                }
                else {
                    index = params.url.indexOf(base.url);
                    length = base.url.length;
                }

                if (index === 0 && length) {
                    url = params.url.substring(0, length);
                    return true;
                }
            });
        }
        return url.replace(/\/$/, "");
    }

    /**
     * If the app was loaded with an "url" query parameter this function will
     * test if it begins with any of the urls defined in KNOWN_SERVERS. The
     * first match found is returned. Otherwise an empty Object is returned.
     * @returns {Object} Might be empty!
     */
    function getServer() {
        var url = "";
        var server = {};
        if (params.url) {
            KNOWN_SERVERS.some(function(base) {
                var index, length;

                if (base.url instanceof RegExp) {
                    var match = params.url.match(base.url);
                    if (match && match[0]) {
                        index = match.index;
                        length = match[0].length;
                    }
                }
                else {
                    index = params.url.indexOf(base.url);
                    length = base.url.length;
                }

                if (index === 0 && length) {
                    url = params.url.substring(0, length);
                    server = base;
                    return true;
                }
            });
        }
        server.url = url.replace(/\/$/, ""); 
        return server;
    }

    /**
     * Parses the query string portion of the given string. If the string
     * contains "?", only the portion after the last "?" character will be
     * parsed. Otherwise the entire string will be parsed. If certain parameter
     * is found more than once the value in the returned object will be an
     * array.
     * @param {String} str
     * @returns {Object} key/value map of parameters
     */
    function parseQueryString(str) {
        var out = {};
        str = String(str || "").trim().split("?")[1] || "";
        str.split(/&/).forEach(function(pair) {
            var tokens = pair.split("=");
            var key    = decodeURIComponent(tokens[0]);
            if (key) {
                var value = decodeURIComponent(tokens[1] || "true");
                if (out.hasOwnProperty(key)) {
                    if (!Array.isArray(out[key])) {
                        out[key] = [out[key]];
                    }
                    out[key].push(value);
                }
                else {
                    out[key] = value;
                }
            }
        });
        return out;
    }

    /**
     * Uses the jQuery Ajax to fetch the given URL but does not even parse it
     * since we only want to use the textContent of the response.
     * @param {String} url
     * @returns {Promise<jQuery.jqXHR>}
     */
    function fetchURL(server, url) {
        var headers = {};
        if (server.headers) {
            headers = server.headers;
        }        
        return $.ajax({
            url  : url,
            converters: {
                "* text"   : String,
                "text html": true,
                "text json": String,
                "text xml" : String
            },
            headers: headers
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
                    var server = getServer();
                    var url = server.url + "/" + res.matches[1];
                    if (lang == "json") {
                        url += "?_format=json";
                    }
                    else if (lang == "xml") {
                        url += "?_format=xml";
                    }

                    var lineText = model.getValueInRange(res.range);
                    var match = lineText.match(re);

                    return {
                        range: {
                            startLineNumber: res.range.startLineNumber,
                            endLineNumber  : res.range.endLineNumber,
                            endColumn      : match[0].indexOf(match[1]) + match[1].length + 1,
                            startColumn    : match[0].indexOf(match[1]) + 1
                        },
                        url: location.origin + location.pathname + "?url=" +
                        encodeURI(encodeURIComponent(url)) + (params.dark ? "&dark=1" : "")
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

                var server = getServer();
                var url = server.url + "/" + match[1];
                if (lang == "json") {
                    url += "?_format=json";
                }
                else if (lang == "xml") {
                    url += "?_format=xml";
                }
                return fetchURL(server, url)
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
     * @param {DOMElement} container The editor container element
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
                theme: params.dark ? "vs-dark" : "vs",
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

        $("body").toggleClass("dark", !!params.dark);
        $("[name=dark]").prop("disabled", !params.dark);

        if (params.url) {
            $(".input-wrap input").val(params.url);

            if (!getBaseURL() && !params.url.match(/^https?:\/\/(localhost|127\.0\.0\.1)/)) {
                message.text('Unknown URL origin. Consider adding your base URL to the known-servers.js file.');
                return;
            }
            else {
                message.text('Loading...');
                var server = getServer();
                fetchURL(server, params.url).then(function(result, code, xhr) {
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
        }
        else {
            message.text('No "url" parameter given!');
        }
    }

    // export the init function as global
    NS.init = init;

})(window, jQuery);
