#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Alle Inline-Styles mit Farben durch CSS-Klassen ersetzen
replacements = [
    # Beschreibungstexte
    ('style="font-size:0.8rem; color:#aaa; margin-top:-10px;"', 'class="desc-hint"'),
    ('style="font-size:0.8rem; color:#b0b0b0; margin-top:-10px;"', 'class="desc-hint"'),
    ('style="color:#aaa; font-size:0.8rem; margin-bottom:5px;"', 'class="text-muted-small"'),
    ('style="color:#b0b0b0; font-size:0.9rem;"', 'class="text-muted-demo"'),
    ('style="font-size:0.8rem; color:#b0b0b0; margin-top:-10px; margin-bottom:15px;"', 'class="desc-hint"'),
    
    # Valve Display
    ('style="width:40px; height:40px; border:3px solid #555; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#222;"', 'class="valve-display"'),
    ('style="font-weight:bold; color:#fff; font-size:1.2rem;"', 'class="valve-value"'),
    
    # Level Display
    ('style="position:relative; width:200px; height:200px; background:#333; border-radius:50%; margin:0 auto; border:4px solid #555;"', 'class="level-display"'),
    ('style="position:absolute; top:50%; left:0; width:100%; height:1px; background:#555;"', 'class="level-line-h"'),
    ('style="position:absolute; left:50%; top:0; width:1px; height:100%; background:#555;"', 'class="level-line-v"'),
    ('style="position:absolute; width:40px; height:40px; background:#00c851; border-radius:50%; top:50%; left:50%; transform:translate(-50%, -50%); transition: all 0.1s linear; box-shadow:0 0 10px #00c851;"', 'class="level-bubble"'),
    
    # Progress Bar
    ('style="background:#444; height:10px; border-radius:5px; margin-bottom:15px;"', 'class="gauge-container"'),
    ('style="width:0%; height:100%; background:var(--accent); border-radius:5px; transition:width 0.3s;"', 'class="gauge-fill"'),
    
    # Dividers
    ('style="margin-top:20px; border-top:1px solid #eee; padding-top:15px;"', 'class="divider-top"'),
    ('style="margin-top:20px; border-top:1px solid #444; padding-top:10px;"', 'class="divider-dark"'),
    
    # Modal
    ('style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:1000; flex-direction:column; align-items:center; justify-content:center; overflow-y:auto;"', 'class="modal-bg"'),
    ('style="background:#1e1e1e; padding:20px; border-radius:8px; max-width:400px; margin:20px auto;"', 'class="modal-box"'),
    ('style="color:white; margin-bottom:15px; text-align:center;"', 'class="modal-title"'),
    ('style="color:#aaa; font-size:0.9rem; text-align:center; margin-bottom:15px;"', 'class="modal-text"'),
    ('style="background:white; padding:5px; border-radius:4px; margin-bottom:15px;"', 'class="canvas-wrapper"'),
    ('style="border:1px solid #ccc; touch-action:none; display:block;"', 'class="signature-canvas"'),
    
    # Buttons
    ('style="flex:1; border:1px solid #00c851; color:#00c851;"', 'class="btn-check-mark"'),
    ('style="flex:1; border:1px solid #ff9900; color:#ff9900;"', 'class="btn-redo"'),
    
    # Calendar
    ('style="margin-top:20px; border-top:1px solid #444; padding-top:10px;"', 'class="calendar-events"'),
    ('style="color:#aaa; text-align:center;"', 'class="calendar-placeholder"'),
    
    # Flex containers
    ('style="display:flex; gap:10px;"', 'class="flex-gap"'),
    ('style="flex:1"', 'class="flex-half"'),
]

for old, new in replacements:
    html = html.replace(old, new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ Alle Inline-Styles mit Farben durch CSS-Klassen ersetzt!')
