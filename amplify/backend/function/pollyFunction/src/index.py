import json
import boto3
import base64
import os

def handler(event, context):
    try:
        # Get request body
        body = {}
        if 'body' in event:
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
        
        # Get parameters from the body
        voice_id = body.get('voiceId', 'Joanna')
        text = body.get('text', 'Hello, how are you today?')
        
        print(f"Generating speech with voice: {voice_id}, text: {text}")

        # Initialize Polly client
        polly_client = boto3.client('polly', region_name='us-east-2')
        
        print("Calling Amazon Polly...")
        # Request speech synthesis
        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat="mp3",
            VoiceId=voice_id  
        )
        
        # Read the audio stream and encode as base64
        if "AudioStream" in response:
            print("Audio stream received from Polly")
            audio_data = response["AudioStream"].read()
            audio_length = len(audio_data)
            print(f"Audio data length: {audio_length} bytes")
            
            encoded_audio = base64.b64encode(audio_data).decode('utf-8')
            encoded_length = len(encoded_audio)
            print(f"Base64 encoded length: {encoded_length} characters")
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'audio': encoded_audio,
                    'message': 'Audio generated successfully',
                    'audioLength': audio_length,
                    'encodedLength': encoded_length
                })
            }
        else:
            print("No AudioStream in Polly response")
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'error': 'No AudioStream in Polly response',
                    'pollyResponse': str(response)
                })
            }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }