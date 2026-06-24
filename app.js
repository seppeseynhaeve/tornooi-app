class TournamentApp {
  constructor() {
    this.players = [];
    this.poules = [];
    this.matches = [];
    this.currentTab = 'players';
    this.scores = {};
    this.schedule = this.generateSchedule();
    this.disciplines = ['Petanque', 'Darts', 'Biljarten'];
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.render();
    setTimeout(() => this.attachEventListeners(), 100);
  }

  generateSchedule() {
    return [
      { time: '10:00', activity: 'Aanvang tornooi' },
      { time: '10:15', activity: 'Start Poulefase - Ronde 1' },
      { time: '11:30', activity: 'Poulefase - Ronde 2' },
      { time: '12:00', activity: '⏸️ PAUZE' },
      { time: '13:30', activity: 'Poulefase - Ronde 3' },
      { time: '14:45', activity: 'Afsluitend Poulematches' },
      { time: '15:30', activity: 'Halve Finales' },
      { time: '16:15', activity: 'Wachten op Finale' },
      { time: '17:00', activity: '🏆 FINALE' },
      { time: '17:45', activity: 'Prijsuitreiking' }
    ];
  }

  // ========================
  // PLAYER MANAGEMENT
  // ========================
  
  addPlayer(name, photoFile) {
    if (!name || name.trim() === '') {
      alert('Voer een geldige naam in');
      return;
    }

    if (photoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const player = {
          id: Date.now(),
          name: name.trim(),
          photo: e.target.result,
          createdAt: new Date().toISOString()
        };
        this.players.push(player);
        this.saveToStorage();
        this.render();
        this.clearPlayerForm();
        setTimeout(() => this.attachEventListeners(), 100);
      };
      reader.readAsDataURL(photoFile);
    } else {
      const player = {
        id: Date.now(),
        name: name.trim(),
        photo: this.getDefaultAvatar(name),
        createdAt: new Date().toISOString()
      };
      this.players.push(player);
      this.saveToStorage();
      this.render();
      this.clearPlayerForm();
      setTimeout(() => this.attachEventListeners(), 100);
    }
  }

  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
    this.saveToStorage();
    this.render();
    setTimeout(() => this.attachEventListeners(), 100);
  }

  getDefaultAvatar(name) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%231e40af' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' font-size='60' font-weight='bold' fill='white' text-anchor='middle' dy='.3em'%3E${initials}%3C/text%3E%3C/svg%3E`;
  }

  clearPlayerForm() {
    const nameInput = document.getElementById('playerName');
    const photoInput = document.getElementById('playerPhoto');
    if (nameInput) nameInput.value = '';
    if (photoInput) photoInput.value = '';
  }

  // ========================
  // POULE SYSTEM (RANDOM DRAW)
  // ========================

  generatePoules() {
    if (this.players.length < 10) {
      alert('Er moeten minstens 10 deelnemers zijn');
      return;
    }

    // Shuffle players
    const shuffled = [...this.players].sort(() => Math.random() - 0.5);
    
    // Create 2 poules of 5 players each
    this.poules = [
      { name: 'Poule A', players: shuffled.slice(0, 5) },
      { name: 'Poule B', players: shuffled.slice(5, 10) }
    ];

    // Generate matches for each poule
    this.generatePouleMatches();
    this.saveToStorage();
    this.currentTab = 'draw';
    this.render();
    setTimeout(() => this.attachEventListeners(), 100);
  }

  generatePouleMatches() {
    this.matches = [];
    let matchId = 0;
    let currentTime = 10 * 60; // 10:00 in minutes
    const matchDuration = 20; // minutes
    
    for (let pouleIndex = 0; pouleIndex < this.poules.length; pouleIndex++) {
      const poule = this.poules[pouleIndex];
      const players = poule.players;

      // Generate round-robin matches
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          // Skip break time
          if (currentTime >= 12 * 60 && currentTime < 13 * 60 + 30) {
            currentTime = 13 * 60 + 30;
          }

          // Cycle through disciplines
          const discipline = this.disciplines[matchId % 3];
          
          const match = {
            id: matchId,
            poule: poule.name,
            players: [
              { ...players[i], score: 0 },
              { ...players[j], score: 0 }
            ],
            discipline: discipline,
            startTime: this.minutesToTime(currentTime),
            status: 'upcoming',
            points: [0, 0]
          };

          this.matches.push(match);
          matchId++;
          currentTime += matchDuration;
        }
      }
    }
  }

  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  // ========================
  // MATCH SCORING
  // ========================

  updateMatchScore(matchId, playerIndex, score) {
    const match = this.matches.find(m => m.id === matchId);
    if (match) {
      match.points[playerIndex] = parseInt(score) || 0;
      this.saveToStorage();
    }
  }

  finishMatch(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (match) {
      match.status = 'finished';
      
      // Award points based on discipline scoring
      this.awardPoints(match);
      
      this.saveToStorage();
      this.render();
      setTimeout(() => this.attachEventListeners(), 100);
    }
  }

  awardPoints(match) {
    const player1 = match.players[0];
    const player2 = match.players[1];
    const score1 = match.points[0];
    const score2 = match.points[1];

    if (!this.scores[player1.id]) this.scores[player1.id] = { petanque: 0, darts: 0, biljarten: 0, total: 0 };
    if (!this.scores[player2.id]) this.scores[player2.id] = { petanque: 0, darts: 0, biljarten: 0, total: 0 };

    let disciplineKey = match.discipline.toLowerCase();

    if (score1 > score2) {
      this.scores[player1.id][disciplineKey] += 3; // Win = 3 points
      this.scores[player2.id][disciplineKey] += 1; // Participation = 1 point
    } else if (score2 > score1) {
      this.scores[player2.id][disciplineKey] += 3;
      this.scores[player1.id][disciplineKey] += 1;
    } else {
      this.scores[player1.id][disciplineKey] += 2; // Draw = 2 points each
      this.scores[player2.id][disciplineKey] += 2;
    }

    // Calculate totals
    this.scores[player1.id].total = this.scores[player1.id].petanque + this.scores[player1.id].darts + this.scores[player1.id].biljarten;
    this.scores[player2.id].total = this.scores[player2.id].petanque + this.scores[player2.id].darts + this.scores[player2.id].biljarten;
  }

  // ========================
  // LEADERBOARD
  // ========================

  getLeaderboard() {
    return this.players
      .map(player => ({
        ...player,
        scores: this.scores[player.id] || { petanque: 0, darts: 0, biljarten: 0, total: 0 }
      }))
      .sort((a, b) => b.scores.total - a.scores.total);
  }

  // ========================
  // STORAGE
  // ========================

  saveToStorage() {
    const data = {
      players: this.players,
      poules: this.poules,
      matches: this.matches,
      scores: this.scores
    };
    localStorage.setItem('tournamentData', JSON.stringify(data));
  }

  loadFromStorage() {
    const data = localStorage.getItem('tournamentData');
    if (data) {
      const parsed = JSON.parse(data);
      this.players = parsed.players || [];
      this.poules = parsed.poules || [];
      this.matches = parsed.matches || [];
      this.scores = parsed.scores || {};
    }
  }

  // ========================
  // RENDERING
  // ========================

  render() {
    const app = document.getElementById('app');
    app.innerHTML = this.getTemplate();
  }

  getTemplate() {
    return `
      <div class="header">
        <h1>🏆 Tornooi Manager</h1>
        <p>Petanque • Darts • Biljarten</p>
      </div>

      <div class="nav-tabs">
        <button class="nav-btn ${this.currentTab === 'players' ? 'active' : ''}" data-tab="players">👥 Deelnemers</button>
        <button class="nav-btn ${this.currentTab === 'draw' ? 'active' : ''}" data-tab="draw">🎰 Loting</button>
        <button class="nav-btn ${this.currentTab === 'schedule' ? 'active' : ''}" data-tab="schedule">📅 Schema</button>
        <button class="nav-btn ${this.currentTab === 'matches' ? 'active' : ''}" data-tab="matches">⚡ Wedstrijden</button>
        <button class="nav-btn ${this.currentTab === 'leaderboard' ? 'active' : ''}" data-tab="leaderboard">📊 Standings</button>
      </div>

      <div class="container">
        ${this.currentTab === 'players' ? this.renderPlayersTab() : ''}
        ${this.currentTab === 'draw' ? this.renderDrawTab() : ''}
        ${this.currentTab === 'schedule' ? this.renderScheduleTab() : ''}
        ${this.currentTab === 'matches' ? this.renderMatchesTab() : ''}
        ${this.currentTab === 'leaderboard' ? this.renderLeaderboardTab() : ''}
      </div>
    `;
  }

  renderPlayersTab() {
    return `
      <h2>📋 Deelnemers Registratie</h2>
      <p>Voeg alle 10 deelnemers toe met hun foto.</p>
      
      <div style="background: var(--light); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <div class="form-group">
          <label>Naam Deelnemer</label>
          <input type="text" id="playerName" placeholder="Voer naam in">
        </div>
        <div class="form-group">
          <label>Foto</label>
          <input type="file" id="playerPhoto" accept="image/*">
        </div>
        <button class="btn btn-primary" id="addPlayerBtn">➕ Voeg Deelnemer Toe</button>
      </div>

      <h3>Geregistreerde Deelnemers (${this.players.length}/10)</h3>
      <div class="players-grid">
        ${this.players.map(player => `
          <div class="player-card">
            <img src="${player.photo}" alt="${player.name}">
            <h3>${player.name}</h3>
            <button class="remove-btn" data-player-id="${player.id}">✕</button>
          </div>
        `).join('')}
      </div>

      ${this.players.length >= 10 ? `
        <div style="text-align: center; margin-top: 30px;">
          <button class="btn btn-success" style="padding: 16px 32px; font-size: 16px;" id="startDrawBtn">
            🎰 Start Loting voor Poulefase
          </button>
        </div>
      ` : ''}
    `;
  }

  renderDrawTab() {
    if (this.poules.length === 0) {
      return `
        <div style="text-align: center; padding: 40px;">
          <p>Er zijn nog geen poules gegenereerd. Ga naar het tabblad "Deelnemers" en start de loting.</p>
          <button class="btn btn-primary" id="goToPlayersBtn">👥 Naar Deelnemers</button>
        </div>
      `;
    }

    return `
      <h2>🎰 Poulefase - Poules</h2>
      <p>De deelnemers zijn opgedeeld in 2 poules van elk 5 spelers.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        ${this.poules.map(poule => `
          <div class="poule-result">
            <h3>${poule.name}</h3>
            <ol>
              ${poule.players.map(p => `<li>${p.name}</li>`).join('')}
            </ol>
          </div>
        `).join('')}
      </div>

      <div style="background: #dbeafe; padding: 20px; border-radius: 12px; margin-top: 30px; border-left: 4px solid var(--primary);">
        <h3 style="color: var(--primary); margin-bottom: 10px;">📋 Speelschema</h3>
        <p>Elk team speelt tegen elkaar 1 keer in elke discipline:</p>
        <ul>
          <li>Totaal ${this.matches.filter(m => m.poule === 'Poule A').length} matches per poule</li>
          <li>Totaal ${this.matches.length} matches in totaal</li>
          <li>Disciplinerotatie: Petanque → Darts → Biljarten</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <button class="btn btn-secondary" id="resetDrawBtn">🔄 Nieuwe Loting</button>
        <button class="btn btn-primary" style="margin-left: 10px;" id="goToMatchesBtn">⚡ Naar Wedstrijden</button>
      </div>
    `;
  }

  renderScheduleTab() {
    return `
      <h2>📅 Tornooi Schema</h2>
      <p>Volledige dagschema van 10:00 tot 17:45</p>
      
      <div class="schedule-container">
        ${this.schedule.map(item => `
          <div class="schedule-item">
            <div class="schedule-time">${item.time}</div>
            <div class="schedule-activity">${item.activity}</div>
          </div>
        `).join('')}
      </div>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid var(--success);">
        <h3 style="color: var(--success); margin-bottom: 10px;">⏱️ Informatie</h3>
        <ul>
          <li>Maximale matchduur: 20 minuten</li>
          <li>Automatische pauze: 12:00 - 13:30</li>
          <li>Finale begint om: 17:00</li>
          <li>Deelnemers: 10</li>
        </ul>
      </div>
    `;
  }

  renderMatchesTab() {
    if (this.matches.length === 0) {
      return `
        <div style="text-align: center; padding: 40px;">
          <p>Er zijn nog geen wedstrijden gegenereerd. Genereer eerst de poules.</p>
          <button class="btn btn-primary" id="goToDrawBtn">🎰 Naar Loting</button>
        </div>
      `;
    }

    const upcomingMatches = this.matches.filter(m => m.status !== 'finished');
    const finishedMatches = this.matches.filter(m => m.status === 'finished');

    return `
      <h2>⚡ Wedstrijden & Scoring</h2>
      
      <div class="scoreboard">
        <div class="scoreboard-item">
          <div class="scoreboard-label">Wedstrijden Gespeeld</div>
          <div class="scoreboard-value">${finishedMatches.length}/${this.matches.length}</div>
        </div>
        <div class="scoreboard-item">
          <div class="scoreboard-label">Komende Wedstrijden</div>
          <div class="scoreboard-value">${upcomingMatches.length}</div>
        </div>
      </div>

      ${upcomingMatches.length > 0 ? `
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Komende Wedstrijden</h3>
        <div class="matches-container">
          ${upcomingMatches.map(match => this.renderMatchCard(match)).join('')}
        </div>
      ` : ''}

      ${finishedMatches.length > 0 ? `
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Afgespeelde Wedstrijden</h3>
        <div class="matches-container">
          ${finishedMatches.map(match => this.renderMatchCard(match, true)).join('')}
        </div>
      ` : ''}
    `;
  }

  renderMatchCard(match, isFinished = false) {
    return `
      <div class="match-card ${isFinished ? 'finished' : 'active'}">
        <div class="match-header">
          <div class="match-time">⏰ ${match.startTime}</div>
          <span class="match-discipline">${match.discipline}</span>
          <span class="match-status ${isFinished ? 'finished' : 'upcoming'}">${isFinished ? '✓ AFGELOPEN' : '🔵 KOMEND'}</span>
        </div>
        
        <div class="match-players">
          ${match.players.map((player, idx) => `
            <div class="player-row">
              <span class="player-name">${player.name}</span>
              <input type="number" class="player-score-input" value="${match.points[idx]}" 
                ${isFinished ? 'disabled' : ''}
                data-match-id="${match.id}" data-player-index="${idx}" 
                placeholder="Score">
            </div>
          `).join('')}
        </div>

        ${!isFinished ? `
          <div class="match-actions">
            <button class="btn btn-success" style="flex: 1;" data-finish-match="${match.id}">✅ Beëindig Match</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderLeaderboardTab() {
    const leaderboard = this.getLeaderboard();

    if (leaderboard.every(p => p.scores.total === 0)) {
      return `
        <div style="text-align: center; padding: 40px;">
          <p>Nog geen wedstrijden afgespeeld. De leaderboard wordt bijgewerkt naarmate matches eindigen.</p>
        </div>
      `;
    }

    return `
      <h2>📊 Leaderboard</h2>
      <p>Huidige Standings na alle afgespeelde wedstrijden</p>
      
      <div class="leaderboard-container">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Deelnemer</th>
              <th style="text-align: center;">Petanque</th>
              <th style="text-align: center;">Darts</th>
              <th style="text-align: center;">Biljarten</th>
              <th style="text-align: center;">Totaal</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboard.map((player, idx) => `
              <tr>
                <td>
                  <span class="rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''}">
                    ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </span>
                </td>
                <td><strong>${player.name}</strong></td>
                <td class="discipline-score">${player.scores.petanque}</td>
                <td class="discipline-score">${player.scores.darts}</td>
                <td class="discipline-score">${player.scores.biljarten}</td>
                <td class="total-score">${player.scores.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-top: 30px; border-left: 4px solid var(--warning);">
        <h3 style="color: var(--warning); margin-bottom: 10px;">📝 Puntensysteem</h3>
        <ul>
          <li><strong>Winnen:</strong> 3 punten per discipline</li>
          <li><strong>Gelijkspel:</strong> 2 punten per discipline</li>
          <li><strong>Verliezen:</strong> 1 punt (deelname)</li>
          <li><strong>Totaal:</strong> Som van alle disciplines</li>
        </ul>
      </div>
    `;
  }

  attachEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentTab = e.target.dataset.tab;
        this.render();
        setTimeout(() => this.attachEventListeners(), 100);
      });
    });

    // Players Tab
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    if (addPlayerBtn) {
      addPlayerBtn.addEventListener('click', () => {
        const name = document.getElementById('playerName').value;
        const photo = document.getElementById('playerPhoto').files[0];
        this.addPlayer(name, photo);
      });
    }

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Weet je zeker dat je deze deelnemer wilt verwijderen?')) {
          this.removePlayer(parseInt(e.target.dataset.playerId));
        }
      });
    });

    // Draw
    const startDrawBtn = document.getElementById('startDrawBtn');
    if (startDrawBtn) {
      startDrawBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.generatePoules();
      });
    }

    const resetDrawBtn = document.getElementById('resetDrawBtn');
    if (resetDrawBtn) {
      resetDrawBtn.addEventListener('click', () => {
        if (confirm('Weet je zeker dat je een nieuwe loting wilt uitvoeren?')) {
          this.poules = [];
          this.matches = [];
          this.scores = {};
          this.saveToStorage();
          this.render();
          setTimeout(() => this.attachEventListeners(), 100);
        }
      });
    }

    // Tab Navigation Buttons
    const goToPlayersBtn = document.getElementById('goToPlayersBtn');
    if (goToPlayersBtn) {
      goToPlayersBtn.addEventListener('click', () => {
        this.currentTab = 'players';
        this.render();
        setTimeout(() => this.attachEventListeners(), 100);
      });
    }

    const goToDrawBtn = document.getElementById('goToDrawBtn');
    if (goToDrawBtn) {
      goToDrawBtn.addEventListener('click', () => {
        this.currentTab = 'draw';
        this.render();
        setTimeout(() => this.attachEventListeners(), 100);
      });
    }

    const goToMatchesBtn = document.getElementById('goToMatchesBtn');
    if (goToMatchesBtn) {
      goToMatchesBtn.addEventListener('click', () => {
        this.currentTab = 'matches';
        this.render();
        setTimeout(() => this.attachEventListeners(), 100);
      });
    }

    // Scoring
    document.querySelectorAll('.player-score-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const matchId = parseInt(e.target.dataset.matchId);
        const playerIndex = parseInt(e.target.dataset.playerIndex);
        const score = e.target.value;
        this.updateMatchScore(matchId, playerIndex, score);
      });
    });

    // Finish Match
    document.querySelectorAll('[data-finish-match]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const matchId = parseInt(e.target.dataset.finishMatch);
        if (confirm('Beëindig deze match?')) {
          this.finishMatch(matchId);
        }
      });
    });
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.tournament = new TournamentApp();
  });
} else {
  window.tournament = new TournamentApp();
}