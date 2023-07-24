from flask import Flask, render_template, request
from PIL import Image, ImageDraw, ImageFont
from http import HTTPStatus
import base64
from io import BytesIO
import json
import os
from datetime import datetime
import requests
import props
import time

# platform detection to allow for prototype sketching/hacking before deploy
is_raspberry_pi = os.uname()[4][:3] == 'arm'
if is_raspberry_pi:
  from inky.auto import auto
  import inky

app = Flask(__name__)

@app.route('/')
def home():
  """Show all the p5 sketches"""
  return render_template('index.html')

@app.route('/strava')
def strava():
  """Show the YTD Strava stats for an athlete.
  
  With a button to generate an image of the stats, and display on a Raspberry Pi eInk.
  For the motivation.
  """
  stats = get_strava_stats()
  return render_template('strava.html', stats=stats)

@app.route('/api/v1/save', methods = ['POST'])
def save():
  """Save and show a sketch png.

  sketchName: str
    The name of the sketch.
  dataURL: str
    The dataURL representation  of a p5.js sketch canvas.

  Saves the sketch as a png image, and flashes to an eInk display if there 
  is one
  """
  data = str(request.get_data(), 'utf-8')
  data_json = json.loads(data)

  sketch_name = data_json['sketchName']
  sketch_file_name = f'static/img/{sketch_name}.png'
  
  # get the data by stripping the start 'data:image/png;base64,'
  encoded_data = data_json['dataURL'].split(',')[1]
  sketch_image_data = BytesIO(base64.b64decode(encoded_data))

  img_data = Image.open(sketch_image_data)
  # An explicit resize seems to be needed, at least on a RPi
  # Newest inkyPhat; old one was 212x104
  display_width = 250
  display_height = 122
  img_png = img_data.resize((display_width, display_height))
  img_png.save(sketch_file_name)
  if is_raspberry_pi:
    display_image(img_png, inky.BLACK)

  return '', HTTPStatus.NO_CONTENT

@app.route('/api/v1/show', methods = ['POST'])
def show():
  """Show an image on the eInk display if there is one"""
  img_name = json.loads(request.get_data())['imgName']
  # Newest inkyPhat; old one was 212x104
  display_width = 250
  display_height = 122
  img_png = Image.open(f'static/img/{img_name}').resize((display_width, display_height))
  if is_raspberry_pi:
    display_image(img_png, inky.BLACK)

  return '', HTTPStatus.NO_CONTENT

@app.route('/api/v1/strava-stats', methods = ['POST'])
def strava_stats():
  """Regenerate and display the YTD Strava stats image"""
  stats = get_strava_stats()

  # Draw the image
  req = request.json
  mode = ''
  if (req and 'mode' in req):
    mode = request.json['mode']

  if (mode == 'dark'):
    bg = 'black'
    text_colour = 'white'
  else:
    bg = 'white'
    text_colour = 'black'

  # Newest inkyPhat; old one was 212x104
  display_width = 250
  display_height = 122  
  img = Image.new('RGB', (display_width, display_height), bg)
  canvas = ImageDraw.Draw(img)
  canvas.text((1, 1), f'{stats["year"]}', font=ImageFont.truetype(f'static/fonts/Roboto-Bold.ttf', 14), fill=text_colour)
  canvas.line((1, 18, display_width - 1, 18), fill=text_colour, width=2)
  # Headers
  font_size = 16
  canvas.text((1, 26), "Runs", font=ImageFont.truetype(f'static/fonts/Roboto-Bold.ttf', font_size), fill=text_colour)
  canvas.text((90, 26), "Rides", font=ImageFont.truetype(f'static/fonts/Roboto-Bold.ttf', font_size), fill=text_colour)
  canvas.text((180, 26), "Swims", font=ImageFont.truetype(f'static/fonts/Roboto-Bold.ttf', font_size), fill=text_colour)
  # Activity counts
  canvas.text((1, 43), f'{stats["run"]["count"]}', font=ImageFont.truetype(f'static/fonts/Roboto-Light.ttf', font_size), fill=text_colour)
  canvas.text((90, 43), f'{stats["ride"]["count"]}', font=ImageFont.truetype(f'static/fonts/Roboto-Light.ttf', font_size), fill=text_colour)
  canvas.text((180, 43), f'{stats["swim"]["count"]}', font=ImageFont.truetype(f'static/fonts/Roboto-Light.ttf', font_size), fill=text_colour)
  # Activity distances
  large_font_size = 30
  canvas.text((1, 68), f'{stats["run"]["distance"]:,}m', font=ImageFont.truetype(f'static/fonts/Roboto-Regular.ttf', large_font_size), fill=text_colour)
  canvas.text((90, 68), f'{stats["ride"]["distance"]:,}m', font=ImageFont.truetype(f'static/fonts/Roboto-Regular.ttf', large_font_size), fill=text_colour)
  canvas.text((180, 68), f'{stats["swim"]["distance"]:,}m', font=ImageFont.truetype(f'static/fonts/Roboto-Regular.ttf', large_font_size), fill=text_colour)
  canvas.line((2, 114, display_width - 1, 114), fill=text_colour, width=2)
  img_png = img.resize((display_width, display_height))
  img_png.save('static/img/stats.png')
  if is_raspberry_pi:
    display_image(img_png, inky.RED)

  return '', HTTPStatus.NO_CONTENT

def display_image(img_png, border_colour):
  """Display image on the eInk display
  
  Image must be converted to an RGB palette to display
  """
  inky_display = auto()
  inky_display.set_border(border_colour)
  img_pal = Image.new("P", (1,1))
  img_pal.putpalette((255, 255, 255, 0, 0, 0, 255, 0, 0) + (0, 0, 0) * 252)
  img_eink = img_png.convert("RGB").quantize(palette=img_pal)
  # rotate the image when the power supply is at the top
  inky_display.set_image(img_eink.rotate(180))
  inky_display.show()

def get_strava_stats():
  """Get the YTD Strava stats for an athlete.

  Return a trimmed-down json response with just the totals, in miles.
  """

  # Get saved API tokens
  with open('strava_tokens.json') as check:
    strava_tokens = json.load(check)

  # If access_token has expired then use the refresh_token to get a new access_token
  if (strava_tokens != None) and (strava_tokens['expires_at'] < time.time()):
    # Make Strava auth API call with your client_id, client_secret and code
    response = requests.post(
                      url = 'https://www.strava.com/oauth/token',
                      data = {
                              'client_id': props.client_id,
                              'client_secret': props.client_secret,
                              'refresh_token': strava_tokens['refresh_token'],
                              'grant_type': 'refresh_token'
                              }
                            )

    # Save tokens to file
    new_strava_tokens = response.json()
    with open('strava_tokens.json', 'w') as outfile:
      json.dump(new_strava_tokens, outfile)

    # Use the new Strava tokens from now on
    strava_tokens = new_strava_tokens
    
  # Get athlete stats
  url = f'https://www.strava.com/api/v3/athletes/{props.athlete_id}/stats'
  access_token = strava_tokens['access_token']
  athlete_stats = requests.get(url + '?access_token=' + access_token).json()

  # Extract YTD number and distances converted to miles
  year = datetime.now().year
  run_count = athlete_stats['ytd_run_totals']['count']
  run_distance = int(round(athlete_stats['ytd_run_totals']['distance']/1609))
  ride_count = athlete_stats['ytd_ride_totals']['count']
  ride_distance = int(round(athlete_stats['ytd_ride_totals']['distance']/1609))
  swim_count = athlete_stats['ytd_swim_totals']['count']
  swim_distance = int(round(athlete_stats['ytd_swim_totals']['distance']/1609))
  stats = {
    "year": year,
    "run": {
      "count": run_count,
      "distance": run_distance,
    },
    "ride": {
      "count": ride_count,
      "distance": ride_distance,
    },
    "swim": {
      "count": swim_count,
      "distance": swim_distance,
    }
  }
  return json.loads(json.dumps(stats))
