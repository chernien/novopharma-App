# ============================================================
# CAPACITOR — obligatoire pour éviter le crash en release
# R8/ProGuard supprime les classes de plugin par défaut
# ============================================================
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.CapacitorPlugin *;
    @com.getcapacitor.PluginMethod *;
}

# MainActivity et bridge WebView JS
-keep class com.novo.app.** { *; }
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Annotations et métadonnées (nécessaires pour Capacitor reflection)
-keepattributes *Annotation*
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes Signature
-keepattributes EnclosingMethod

# Conserver les numéros de ligne pour le débogage des stack traces release
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Cordova compat (utilisé par capacitor-cordova-android-plugins)
-keep class org.apache.cordova.** { *; }
