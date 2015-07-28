# -*- coding: utf-8 -*-
import csv
import json

FIRST_NAMES_F = "assets/first-names-f.csv"
FIRST_NAMES_M = "assets/first-names-m.csv"
LAST_NAMES = "assets/last-names.csv"

OUT_FIRST_NAMES = "../public/data/first-names.json"
OUT_LAST_NAMES = "../public/data/last-names.json"

MAX_FIRST_NAMES = 5000
MAX_LAST_NAMES = 5000

fnames = []
lnames = []

with open(FIRST_NAMES_F, 'rb') as f:
    r = csv.reader(f, delimiter=',')
    for name, freq, cum_freq, rank in r:
        fnames.append({
            'n': name.lower(),
            'r': rank,
            'g': 'f'
        })

with open(FIRST_NAMES_M, 'rb') as f:
    r = csv.reader(f, delimiter=',')
    for name, freq, cum_freq, rank in r:
        fnames.append({
            'n': name.lower(),
            'r': rank,
            'g': 'm'
        })

fnames = sorted(fnames, key=lambda k: k['r'])
fnames = fnames[:MAX_FIRST_NAMES]

with open(LAST_NAMES, 'rb') as f:
    r = csv.reader(f, delimiter=',')
    for name, freq, cum_freq, rank in r:
        if len(lnames) >= MAX_LAST_NAMES:
            break
        else:
            lnames.append({
                'n': name.lower(),
                'r': rank
            })

with open(OUT_FIRST_NAMES, 'w') as outfile:
    json.dump(fnames, outfile)
    print('Successfully wrote '+str(len(fnames))+' first names to JSON file: '+OUT_FIRST_NAMES)

with open(OUT_LAST_NAMES, 'w') as outfile:
    json.dump(lnames, outfile)
    print('Successfully wrote '+str(len(lnames))+' last names to JSON file: '+OUT_LAST_NAMES)
