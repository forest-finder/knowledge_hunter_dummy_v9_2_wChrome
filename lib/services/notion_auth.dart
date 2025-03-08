import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:knowledge_hunter_dummy_v9_2_wChrome/config/env_config.dart';

/// A class to handle Notion authentication securely
class NotionAuth {
  /// Get the client ID from environment variables
  String get clientId => EnvConfig.notionClientId;
  
  /// Get the client secret from environment variables
  String get clientSecret => EnvConfig.notionClientSecret;
  
  /// Get the redirect URI from environment variables
  String get redirectUri => EnvConfig.notionRedirectUri;

  /// Fetch an access token using the authorization code
  Future<String?> fetchToken(String code) async {
    // Create Basic Auth header using client ID and secret
    final String basicAuth = 'Basic ' + base64Encode(utf8.encode('$clientId:$clientSecret'));

    final Uri url = Uri.parse('https://api.notion.com/v1/oauth/token');

    final Map<String, String> headers = {
      'Authorization': basicAuth,
      'Content-Type': 'application/json',
    };

    final Map<String, String> body = {
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': redirectUri,
    };

    try {
      final http.Response response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        // Successful response
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return responseData['access_token'];
      } else {
        // Error response
        print('Error: ${response.statusCode}, ${response.body}');
        return null;
      }
    } catch (e) {
      print('Error during HTTP request: $e');
      return null;
    }
  }

  /// Initiate the OAuth login flow
  Future<void> login() async {
    final authUrl = 'https://api.notion.com/v1/oauth/authorize?client_id=$clientId&response_type=code&owner=user&redirect_uri=${Uri.encodeComponent(redirectUri)}';

    // Launch the authorization URL
    if (await canLaunch(authUrl)) {
      await launch(authUrl);
    } else {
      throw 'Could not launch $authUrl';
    }
  }

  /// Fetch databases from Notion
  Future<List<Map<String, dynamic>>> fetchDatabases(String accessToken) async {
    final response = await http.post(
      Uri.parse('https://api.notion.com/v1/search'),
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Notion-Version': '2022-06-28',
      },
      body: jsonEncode({
        'filter': {
          'property': 'object',
          'value': 'database',
        },
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch databases: ${response.body}');
    }

    final data = jsonDecode(response.body);
    final databases = List<Map<String, dynamic>>.from(data['results']);
    return databases;
  }

  /// Write data to a Notion database
  Future<void> writeToNotion(
      String accessToken, String databaseId, String title, context) async {
    final properties = {
      "Name": {
        "title": [
          {
            "text": {
              "content": title,
            }
          }
        ]
      },
    };

    final response = await http.post(
      Uri.parse('https://api.notion.com/v1/pages'),
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'parent': {'database_id': databaseId},
        'properties': properties,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to write to Notion: ${response.body}');
    }
  }
}