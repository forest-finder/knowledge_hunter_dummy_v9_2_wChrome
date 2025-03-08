import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;
import 'package:knowledge_hunter_dummy_v9_2_wChrome/config/env_config.dart';

/// A class to safely provide Firebase configuration options
class FirebaseConfig {
  // Private constructor to prevent instantiation
  FirebaseConfig._();

  /// Get the appropriate Firebase options for the current platform
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'FirebaseConfig has not been configured for macOS.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'FirebaseConfig has not been configured for Windows.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'FirebaseConfig has not been configured for Linux.',
        );
      default:
        throw UnsupportedError(
          'FirebaseConfig is not supported for this platform.',
        );
    }
  }

  /// Web platform Firebase options
  static FirebaseOptions get web {
    // In a real app, you would get these values from environment variables
    // For this example, we're using placeholder values
    return FirebaseOptions(
      apiKey: EnvConfig.get('FIREBASE_WEB_API_KEY'),
      appId: '1:890461324856:web:953d608ad9fce05fdb08cd',
      messagingSenderId: '890461324856',
      projectId: 'knowledge-hunter-45649',
      authDomain: 'knowledge-hunter-45649.firebaseapp.com',
      storageBucket: 'knowledge-hunter-45649.appspot.com',
    );
  }

  /// Android platform Firebase options
  static FirebaseOptions get android {
    return FirebaseOptions(
      apiKey: EnvConfig.get('FIREBASE_ANDROID_API_KEY'),
      appId: '1:890461324856:android:276d5f7f9b829df6db08cd',
      messagingSenderId: '890461324856',
      projectId: 'knowledge-hunter-45649',
      storageBucket: 'knowledge-hunter-45649.appspot.com',
    );
  }

  /// iOS platform Firebase options
  static FirebaseOptions get ios {
    return FirebaseOptions(
      apiKey: EnvConfig.get('FIREBASE_IOS_API_KEY'),
      appId: '1:890461324856:ios:c49110dcef51b06ddb08cd',
      messagingSenderId: '890461324856',
      projectId: 'knowledge-hunter-45649',
      storageBucket: 'knowledge-hunter-45649.appspot.com',
      iosBundleId: 'com.swordsoffirepodcast.knowledgeHunter',
    );
  }
}