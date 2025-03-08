import 'package:flutter_dotenv/flutter_dotenv.dart';

/// A class to safely access environment variables
class EnvConfig {
  // Private constructor to prevent instantiation
  EnvConfig._();

  /// Initialize environment variables
  static Future<void> init() async {
    await dotenv.load(fileName: 'assets/.env');
  }

  /// Get a value from environment variables with a fallback
  static String get(String key, {String defaultValue = ''}) {
    return dotenv.env[key] ?? defaultValue;
  }

  // Stripe API Keys
  static String get stripeSecretKey => get('STRIPE_SECRET_ID');
  static String get stripePublishedKey => get('STRIPE_PUBLISHED_KEY');

  // Client IDs and Secrets
  static String get clientId => get('CLIENT_ID');
  static String get clientSecretId => get('CLIENT_SECRET_ID');

  // AI API Keys
  static String get chatGptApiKey => get('CHAT_GPT_API_KEY');
  static String get geminiApiKey => get('GEMINI_API_KEY');
  static String get grokApiKey => get('GROK_API_KEY');

  // Notion API
  static String get notionClientId => get('NOTION_CLIENT_ID', defaultValue: '171d872b-594c-80ab-bc47-0037fbd78eff');
  static String get notionClientSecret => get('NOTION_CLIENT_SECRET');
  static String get notionRedirectUri => get('NOTION_REDIRECT_URI', defaultValue: 'https://knowledgehunter.ai/setting');
}