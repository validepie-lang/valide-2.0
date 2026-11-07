#!/bin/bash
# uso: capturar.sh <pasta-saida> <rota> [rota...]
# Fotografa cada rota em 1440 claro, 1440 escuro, 768 claro e 360 claro.
# 360 vai por iframe: o Chrome no macOS nao abre janela abaixo de ~500px.
OUT="$1"; shift
BASE="${BASE:-http://localhost:3000}"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LIGHT="--blink-settings=preferredColorScheme=1"
mkdir -p "$OUT"
shot() { "$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 $3 --window-size=$2 --screenshot="$1" "$4" >/dev/null 2>&1; }
for r in "$@"; do
  n=$(echo "$r" | sed 's#^/##; s#[/?=&]#_#g'); [ -z "$n" ] && n=home
  shot "$OUT/$n-1440.png" 1440,1800 "$LIGHT" "$BASE$r"
  shot "$OUT/$n-1440-dark.png" 1440,1800 "" "$BASE$r"
  shot "$OUT/$n-768.png" 768,1800 "$LIGHT" "$BASE$r"
  printf '<!doctype html><body style="margin:0"><iframe src="%s" width="360" height="2200" style="border:0"></iframe>' "$BASE$r" > "$OUT/$n-360.html"
  shot "$OUT/$n-360.png" 400,2200 "$LIGHT" "file://$OUT/$n-360.html"
  echo "ok $r"
done
