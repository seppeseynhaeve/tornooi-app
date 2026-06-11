# 🏆 Tornooi Manager

Een volledige web-applicatie voor het beheren van een dagelijks tornooi met drie disciplines: **Petanque**, **Darts** en **Biljarten**.

## 🎯 Features

### 1. **Deelnemersbeheer**
- Voeg alle 10 deelnemers toe met hun naam en foto
- Standaard avatar gegenereerd op basis van initialen
- Eenvoudige verwijdering van deelnemers

### 2. **Poulefase & Loting**
- Automatische willekeurige verdeling in 2 poules van 5 spelers
- Elk team speelt tegen elkaar in elke discipline
- Totaal 30 matches (10 per poule × 3 disciplines)
- Discipline-rotatie per match

### 3. **Wedstrijden & Scoring**
- Inputvelden voor scores per speler
- Automatische puntstoewijzing na afloop
- Scorebord met voortgang van het tornooi
- Status tracking (Komend, Afgelopen)

### 4. **Puntensysteem**
per discipline:
- **Winnen**: 3 punten
- **Gelijkspel**: 2 punten (elk)
- **Verliezen**: 1 punt (deelname)
- **Totaal**: Som van alle disciplines

### 5. **Leaderboard**
- Live rankings per discipline
- Totaalscore rangschikking
- Medailles (🥇🥈🥉) voor top 3

### 6. **Tornooi Schema**
- Volledige dag schema van 10:00 tot 17:45
- Automatische pauze tussen 12:00 en 13:30
- Matchduur: maximaal 20 minuten
- Finale scheduled om 17:00

## 📅 Daagschema

```
10:00 - Start tornooi
10:15 - Poulefase Ronde 1
11:30 - Poulefase Ronde 2
12:00 - PAUZE
13:30 - Poulefase Ronde 3
14:45 - Afsluitend Poulematches
15:30 - Halve Finales
16:15 - Wachten op Finale
17:00 - FINALE
17:45 - Prijsuitreiking
```

## 🚀 Gebruik

### Stap 1: Deelnemers Registreren
1. Ga naar het tabblad "👥 Deelnemers"
2. Voer de naam in van elke deelnemer
3. Upload een foto (optioneel)
4. Klik "➕ Voeg Deelnemer Toe"
5. Herhaal totdat alle 10 deelnemers zijn toegevoegd

### Stap 2: Start de Loting
1. Klik de knop "🎰 Start Loting voor Poulefase"
2. De app verdeelt automatisch spelers in poules
3. Bekijk de poules in het tabblad "🎰 Loting"

### Stap 3: Wedstrijden Ingeven
1. Ga naar het tabblad "⚡ Wedstrijden"
2. Voer voor elke match de scores in
3. Klik "✅ Beëindig Match" om deze af te ronden
4. Punten worden automatisch toegewezen

### Stap 4: Volg de Leaderboard
1. Ga naar het tabblad "📊 Standings"
2. Bekijk live rankings
3. Zie top 3 met medailles

## 💾 Opslag

Alle gegevens worden opgeslagen in de browser met **LocalStorage**:
- Deelnemers (met foto's als base64)
- Poules
- Matches
- Scores

**Opmerking**: Wis je browsercache niet, anders worden alle gegevens verwijderd!

## 📱 Responsive Design

- ✅ Desktop
- ✅ Tablet
- ✅ Mobiel
- ✅ Print-friendly

## 🎨 Kleuren

- Primair: Blauw (#1e40af)
- Secundair: Paars (#7c3aed)
- Succes: Groen (#10b981)
- Waarschuwing: Oranje (#f59e0b)
- Gevaar: Rood (#ef4444)

## 📊 Scoreberekening Voorbeeld

**Petanque Match: Speler A (15 punten) vs Speler B (12 punten)**
- Speler A wint → +3 punten in Petanque
- Speler B verliest maar speelt → +1 punt in Petanque

Als Speler A 3 matches wint in Petanque:
- Petanque totaal: 9 punten
- Plus scores uit Darts en Biljarten
- Eindstand: Totale score bepaalt ranking

## 🔧 Technologie

- **HTML5**: Structuur
- **CSS3**: Styling en animations
- **Vanilla JavaScript**: Functionaliteit
- **LocalStorage**: Data persistence
- **No dependencies**: Zero external libraries

## 📄 Licentie

Vrij te gebruiken voor eigen tornooi.

---

**Veel succes met het tornooi!** 🎉
