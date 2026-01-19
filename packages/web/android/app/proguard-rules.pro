# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt

# ============================================================
# CAPACITOR
# ============================================================

# Capacitor core
-keep class com.getcapacitor.** { *; }
-keep @interface com.getcapacitor.annotation.* { *; }

# Capacitor plugins
-keep class com.capacitorjs.plugins.** { *; }

# ============================================================
# FIREBASE
# ============================================================

-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# ============================================================
# JAVASCRIPT INTERFACE
# ============================================================

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ============================================================
# WEBVIEW
# ============================================================

-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ============================================================
# GENERAL
# ============================================================

# Keep source file names and line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
-renamesourcefileattribute SourceFile

# For native methods, see http://proguard.sourceforge.net/manual/examples.html#native
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep setters in Views so that animations can still work.
-keepclassmembers public class * extends android.view.View {
    void set*(***);
    *** get*();
}

# For enumeration classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelables
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# ============================================================
# REMOVE DEBUG LOGS IN RELEASE
# ============================================================

-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
}
