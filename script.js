const elements = {
  navMenuBtn: document.getElementById('nav-menu-btn'),
  navbarMobile: document.getElementById('navbar-mobile'),
  goalInput: document.getElementById('goal-input'),
  addGoalBtn: document.getElementById('add-goal-btn'),
  goalsContainer: document.getElementById('goals-container'),
  emptyState: document.getElementById('empty-state'),
  totalGoals: document.getElementById('total-goals'),
  completedGoals: document.getElementById('completed-goals'),
  activeGoals: document.getElementById('active-goals'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  conversationLines: document.getElementById('conversation-lines'),
  goalDropdown: document.getElementById('goal-dropdown'),
  goalCustom: document.getElementById('goal-custom'),
  generateSuggestionsBtn: document.getElementById('generate-suggestions-btn'),
  suggestionsContainer: document.getElementById('suggestions-container')
};

let suggestionBlockCount = 0;

function detectTone(text) {
  const lowerText = text.toLowerCase();

  const casualIndicators = [
    /\b(yo|hey|lol|haha|wanna|gonna|ain't|kinda|sorta|dude|bro|man|girl|sup|what's|you're|i'm|don't|won't|can't)\b/gi,
    /[!?]{2,}/,
    /\b(omg|wtf|lmao|rofl)\b/gi,
    /\b(like|dunno|nah|yeah|yea|okay|ok)\b/gi,
    /\b(fr|tbh|ngl|imo|ik)\b/gi,
  ];

  const pidginIndicators = [
    /\b(abi|no b|abeg|jare|babes|bae|sef|sha|na|wahala|fine fine|small small|go slow|sharp sharp)\b/gi,
    /\b(wetin|wetin dey|dem|dey|don|nor|go|for)\b/gi,
  ];

  const formalIndicators = [
    /\b(would you|could you|kindly|sincerely|regards|respectfully|appreciate|concerning|furthermore|moreover|however)\b/gi,
    /\b(greetings|dear|yours truly|best regards)\b/gi,
    /[.!?]\s+[A-Z]/,
  ];

  const coreText = text.split('\n').slice(0, 5).join(' ');

  let casualScore = 0;
  let formalScore = 0;
  let pidginScore = 0;

  casualIndicators.forEach(indicator => {
    const matches = coreText.match(indicator);
    if (matches) casualScore += matches.length;
  });

  pidginIndicators.forEach(indicator => {
    const matches = coreText.match(indicator);
    if (matches) pidginScore += matches.length;
  });

  formalIndicators.forEach(indicator => {
    const matches = coreText.match(indicator);
    if (matches) formalScore += matches.length;
  });

  if (pidginScore > 0 && pidginScore >= casualScore && pidginScore >= formalScore) {
    return 'pidgin';
  }

  if (formalScore > casualScore) {
    return 'formal';
  }

  if (casualScore > 0) {
    return 'casual';
  }

  return 'neutral';
}

function getConversationTone() {
  const conversation = getConversationText();
  if (conversation.length === 0) return 'neutral';

  const allText = conversation.map(c => c.text).join(' ');
  return detectTone(allText);
}

function generateNextTextSuggestions(goal, tone) {
  const templates = {
    'casual-hookup': {
      casual: [
        'Are you free this weekend?',
        'What are you looking for exactly?',
        'Do you want to grab a drink first?',
        'Looking for something discreet?',
        'No drama, just fun?',
        'Interested in meeting up?'
      ],
      formal: [
        'Would you be available to meet this weekend?',
        'May I inquire what you are seeking?',
        'Would you be interested in meeting for a drink?',
        'Are you looking for a discreet arrangement?',
        'Would you prefer to keep this uncomplicated?',
        'Would you be interested in meeting?'
      ],
      pidgin: [
        'You free this weekend na?',
        'Wetin you really dey look for?',
        'You wan grab drink first?',
        'You want something low-key?',
        'No need make we play games, yeah?',
        'You interested in meeting up?'
      ]
    },
    'one-night-stand': {
      casual: [
        'This Friday sound good?',
        'What\'s your availability?',
        'Want to keep it simple?',
        'Just one night, no strings?',
        'You free this week?',
        'Interested in no-commitment?'
      ],
      formal: [
        'Would Friday be suitable for you?',
        'When might you be available?',
        'Would you prefer to keep this straightforward?',
        'Would one evening suffice for your needs?',
        'Are you available this week?',
        'Would you be interested in a single encounter?'
      ],
      pidgin: [
        'Friday go work for you?',
        'Wetin your schedule look like?',
        'You good with keeping am simple?',
        'Just one night, no long thing?',
        'You free this week na?',
        'You interested in this kinda thing?'
      ]
    },
    'get-laid': {
      casual: [
        'So what are you really looking for?',
        'We on the same page?',
        'How soon are you thinking?',
        'Let\'s skip the small talk?',
        'Direct approach - interested?',
        'What\'s your timeline?'
      ],
      formal: [
        'May I clarify what your intentions are?',
        'Are we aligned in our expectations?',
        'What timeframe are you considering?',
        'Shall we dispense with formalities?',
        'Are you genuinely interested?',
        'What is your anticipated timeline?'
      ],
      pidgin: [
        'Wetin exactly you dey look for?',
        'We on the same lane?',
        'How soon you ready?',
        'Make we cut to the chase?',
        'You serious about this?',
        'Wetin your timeline be?'
      ]
    },
    'fwb': {
      casual: [
        'Could we stay friends outside of this?',
        'Okay with keeping it casual?',
        'Want to establish some boundaries first?',
        'How often would work for you?',
        'Should we set some ground rules?',
        'Think we could make this work?'
      ],
      formal: [
        'Would you be comfortable maintaining a friendship outside of this arrangement?',
        'Are you amenable to keeping this casual?',
        'Would you like to establish boundaries beforehand?',
        'What frequency would be appropriate for you?',
        'Should we establish ground rules?',
        'Do you believe this arrangement could work?'
      ],
      pidgin: [
        'We go stay friends after this?',
        'You good with keeping am casual?',
        'You want make we set rules first?',
        'How often you available?',
        'We need to make some agreement?',
        'You think this go work for us?'
      ]
    },
    'no-strings': {
      casual: [
        'No expectations - that cool with you?',
        'Just keeping it simple?',
        'You good with no commitment?',
        'No strings attached - agreed?',
        'We both on the same page?',
        'Low pressure situation for you?'
      ],
      formal: [
        'Would you be comfortable with no expectations?',
        'Shall we keep this straightforward?',
        'Are you amenable to a no-commitment arrangement?',
        'Agreed that there are no strings attached?',
        'Are we in agreement regarding our intentions?',
        'Would you prefer a low-pressure situation?'
      ],
      pidgin: [
        'No expectations, you good?',
        'Just make we keep am simple?',
        'You comfortable with no commitment?',
        'No strings attached, yes?',
        'We on the same understanding?',
        'You prefer low-key situation?'
      ]
    },
    'long-term': {
      casual: [
        'What are you looking for in a partner?',
        'What\'s important to you in a relationship?',
        'Where do you see yourself in 5 years?',
        'What are your life goals?',
        'What matters most to you?',
        'How do you see a healthy relationship?'
      ],
      formal: [
        'What qualities would you seek in a long-term partner?',
        'What elements are essential to a fulfilling relationship for you?',
        'How do you envision your future?',
        'What are your primary life objectives?',
        'What values are most important to you?',
        'How would you characterize a healthy relationship?'
      ],
      pidgin: [
        'Wetin you dey look for in person for keep?',
        'Wetin matter to you for relationship?',
        'Where you see yourself in 5 years time?',
        'Wetin your dreams be?',
        'Wetin really important to you?',
        'How you see proper relationship look like?'
      ]
    },
    'marriage': {
      casual: [
        'What are your thoughts on marriage?',
        'Long-term commitment - would you consider it?',
        'What matters most in a life partner?',
        'How do you picture your future?',
        'Would you want to build a life together?',
        'What\'s your vision for the future?'
      ],
      formal: [
        'What are your perspectives regarding matrimony?',
        'Would you be open to a long-term commitment?',
        'What qualities would you prioritize in a life partner?',
        'How do you envision your future?',
        'Would you be interested in building a life together?',
        'What are your long-term aspirations?'
      ],
      pidgin: [
        'Wetin you think about marriage?',
        'You ready for long-time commitment?',
        'Wetin important for you for person wey you go marry?',
        'How you picture your future?',
        'You want build life with somebody?',
        'Wetin your vision for future?'
      ]
    },
    'short-term': {
      casual: [
        'How long are you thinking?',
        'What\'s your timeline looking like?',
        'Something casual for now?',
        'Are you open to seeing where this goes?',
        'No pressure for anything serious?',
        'Want to take it slow and see?'
      ],
      formal: [
        'What duration are you considering?',
        'What is your anticipated timeframe?',
        'Would you be interested in a casual arrangement?',
        'Are you open to exploring where this leads?',
        'Would you prefer a low-pressure approach?',
        'Would you be interested in proceeding gradually?'
      ],
      pidgin: [
        'You thinking how long?',
        'Wetin your timeline be?',
        'Something casual for now go work?',
        'You open to see where this go?',
        'No pressure make we rush into anything?',
        'You want make we go slow first?'
      ]
    },
    'casual': {
      casual: [
        'Want to hang out sometime?',
        'No pressure, just seeing if there\'s chemistry?',
        'What do you like to do for fun?',
        'Interested in grabbing coffee?',
        'Maybe we could catch a movie?',
        'Want to see if we click?'
      ],
      formal: [
        'Would you be interested in spending time together?',
        'No pressure - I am simply curious about our compatibility.',
        'What activities do you enjoy?',
        'Would you be interested in meeting for coffee?',
        'Would you perhaps be interested in attending a film?',
        'Would you like to explore our compatibility?'
      ],
      pidgin: [
        'You want hang out sometime?',
        'No pressure na, just checking chemistry?',
        'Wetin you like do for fun?',
        'You interested in coffee?',
        'We go watch movie together?',
        'You want see if we fit together?'
      ]
    },
    'friendship': {
      casual: [
        'Want to grab coffee sometime?',
        'Would you want to hang out as friends?',
        'Think we could be good friends?',
        'What do you do for fun?',
        'Want to get to know each other better?',
        'Sound cool to you?'
      ],
      formal: [
        'Would you be interested in meeting for coffee?',
        'Would you be open to a friendship?',
        'Do you believe we could develop a good friendship?',
        'What are your recreational interests?',
        'Would you be interested in becoming better acquainted?',
        'Does this sound agreeable to you?'
      ],
      pidgin: [
        'You want coffee with me?',
        'You want make we be friends?',
        'You think we go be good friends?',
        'Wetin you do for fun?',
        'You want know me better?',
        'That one sound good for you?'
      ]
    },
    'default': {
      casual: [
        'What brings you here?',
        'What are you looking for?',
        'Tell me a bit about yourself?',
        'What matters to you?',
        'Where do you see this going?',
        'What are your thoughts on this?'
      ],
      formal: [
        'What brings you to this platform?',
        'What are your intentions?',
        'Could you tell me more about yourself?',
        'What matters most to you?',
        'Where would you like this to lead?',
        'What are your thoughts on this matter?'
      ],
      pidgin: [
        'Wetin bring you here?',
        'Wetin you dey look for?',
        'Tell me about yourself na?',
        'Wetin matter to you?',
        'Where you see this one go?',
        'Wetin you think about this?'
      ]
    }
  };

  const goalTemplates = templates[goal] || templates.default;
  const toneTemplates = goalTemplates[tone] || goalTemplates.casual;

  const shuffled = [...toneTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function showError(element, message) {
  element.textContent = message;
  setTimeout(() => {
    element.textContent = '';
  }, 5000);

async function loadGoals() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading goals:', error);
    return;
  }

  allGoals = data || [];
  renderGoals();
  updateStats();
}

function renderGoals() {
  const filteredGoals = allGoals.filter(goal => {
    if (currentFilter === 'active') return !goal.completed;
    if (currentFilter === 'completed') return goal.completed;
    return true;
  });

  if (filteredGoals.length === 0) {
    elements.goalsContainer.innerHTML = '';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  elements.goalsContainer.innerHTML = filteredGoals
    .map(goal => `
      <div class="goal-item ${goal.completed ? 'completed' : ''}" data-id="${goal.id}">
        <div class="goal-checkbox" data-id="${goal.id}"></div>
        <span class="goal-text">${escapeHtml(goal.title)}</span>
        <button class="goal-delete" data-id="${goal.id}">×</button>
      </div>
    `)
    .join('');

  document.querySelectorAll('.goal-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', handleToggleGoal);
  });

  document.querySelectorAll('.goal-delete').forEach(btn => {
    btn.addEventListener('click', handleDeleteGoal);
  });
}

function updateStats() {
  const total = allGoals.length;
  const completed = allGoals.filter(g => g.completed).length;
  const active = total - completed;

  elements.totalGoals.textContent = total;
  elements.completedGoals.textContent = completed;
  elements.activeGoals.textContent = active;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function handleAddGoal() {
  const title = elements.goalInput.value.trim();

  if (!title) return;

  elements.addGoalBtn.disabled = true;

  const { data, error } = await supabase
    .from('goals')
    .insert([
      {
        user_id: currentUser.id,
        title,
        completed: false
      }
    ])
    .select()
    .single();

  elements.addGoalBtn.disabled = false;

  if (error) {
    console.error('Error adding goal:', error);
    return;
  }

  elements.goalInput.value = '';
  allGoals.unshift(data);
  renderGoals();
  updateStats();
}

async function handleToggleGoal(e) {
  const goalId = e.target.dataset.id;
  const goal = allGoals.find(g => g.id === goalId);

  if (!goal) return;

  const newCompleted = !goal.completed;

  const { error } = await supabase
    .from('goals')
    .update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null
    })
    .eq('id', goalId);

  if (error) {
    console.error('Error updating goal:', error);
    return;
  }

  goal.completed = newCompleted;
  goal.completed_at = newCompleted ? new Date().toISOString() : null;
  renderGoals();
  updateStats();
}

async function handleDeleteGoal(e) {
  const goalId = e.target.dataset.id;

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting goal:', error);
    return;
  }

  allGoals = allGoals.filter(g => g.id !== goalId);
  renderGoals();
  updateStats();
}

function handleFilterChange(e) {
  if (!e.target.classList.contains('filter-btn')) return;

  currentFilter = e.target.dataset.filter;

  elements.filterBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  renderGoals();
}

function showApp() {
  elements.authSection.classList.add('hidden');
  elements.appSection.classList.remove('hidden');
  elements.userEmail.textContent = currentUser.email;
  loadGoals();
  initializeConversation();
  initializeGoalSection();
}

function initializeConversation() {
  conversationLineId = 0;
  elements.conversationLines.innerHTML = '';
  const initialLine = createConversationLine('me', '');
  elements.conversationLines.appendChild(initialLine);
  updateConversationUI();
}

function getSelectedGoal() {
  const customGoal = elements.goalCustom.value.trim();
  if (customGoal) {
    return customGoal;
  }
  return elements.goalDropdown.value;
}

function initializeGoalSection() {
  elements.goalDropdown.value = '';
  elements.goalCustom.value = '';

  elements.goalDropdown.addEventListener('change', () => {
    if (elements.goalDropdown.value) {
      elements.goalCustom.value = '';
    }
  });

  elements.goalCustom.addEventListener('input', () => {
    if (elements.goalCustom.value.trim()) {
      elements.goalDropdown.value = '';
    }
  });
}

function getConversationText() {
  const lines = elements.conversationLines.querySelectorAll('.conversation-line');
  return Array.from(lines).map(line => {
    const speaker = line.querySelector('.speaker-select').value;
    const text = line.querySelector('.conversation-input').value;
    return { speaker, text };
  }).filter(line => line.text.trim());
}

const suggestionTemplates = {
  'casual-hookup': [
    'Are you free this weekend?',
    'What are you looking for exactly?',
    'Do you want to grab a drink first?',
    'Looking for something discreet?',
    'No drama, just fun?',
    'Interested in meeting up?'
  ],
  'one-night-stand': [
    'This Friday sound good?',
    'What\'s your availability?',
    'Want to keep it simple?',
    'Just one night, no strings?',
    'You free this week?',
    'Interested in no-commitment?'
  ],
  'get-laid': [
    'So what are you really looking for?',
    'We on the same page?',
    'How soon are you thinking?',
    'Let\'s skip the small talk?',
    'Direct approach - interested?',
    'What\'s your timeline?'
  ],
  'fwb': [
    'Could we stay friends outside of this?',
    'Okay with keeping it casual?',
    'Want to establish some boundaries first?',
    'How often would work for you?',
    'Should we set some ground rules?',
    'Think we could make this work?'
  ],
  'no-strings': [
    'No expectations - that cool with you?',
    'Just keeping it simple?',
    'You good with no commitment?',
    'No strings attached - agreed?',
    'We both on the same page?',
    'Low pressure situation for you?'
  ],
  'long-term': [
    'What are you looking for in a partner?',
    'What\'s important to you in a relationship?',
    'Where do you see yourself in 5 years?',
    'What are your life goals?',
    'What matters most to you?',
    'How do you see a healthy relationship?'
  ],
  'marriage': [
    'What are your thoughts on marriage?',
    'Long-term commitment - would you consider it?',
    'What matters most in a life partner?',
    'How do you picture your future?',
    'Would you want to build a life together?',
    'What\'s your vision for the future?'
  ],
  'short-term': [
    'How long are you thinking?',
    'What\'s your timeline looking like?',
    'Something casual for now?',
    'Are you open to seeing where this goes?',
    'No pressure for anything serious?',
    'Want to take it slow and see?'
  ],
  'casual': [
    'Want to hang out sometime?',
    'No pressure, just seeing if there\'s chemistry?',
    'What do you like to do for fun?',
    'Interested in grabbing coffee?',
    'Maybe we could catch a movie?',
    'Want to see if we click?'
  ],
  'friendship': [
    'Want to grab coffee sometime?',
    'Would you want to hang out as friends?',
    'Think we could be good friends?',
    'What do you do for fun?',
    'Want to get to know each other better?',
    'Sound cool to you?'
  ],
  'default': [
    'What brings you here?',
    'What are you looking for?',
    'Tell me a bit about yourself?',
    'What matters to you?',
    'Where do you see this going?',
    'What are your thoughts on this?'
  ]
};

function generateSuggestions(goal) {
  const templates = suggestionTemplates[goal] || suggestionTemplates.default;
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function createSuggestionBlock(suggestions, isFirst = false) {
  const block = document.createElement('div');
  block.className = `suggestion-block ${isFirst ? 'first' : ''}`;

  let html = '<div class="suggestions-title">Choose a message or generate new ones:</div>';
  html += '<div class="suggestions-list">';

  suggestions.forEach((suggestion, idx) => {
    html += `<button class="suggestion-option" data-idx="${idx}">${suggestion}</button>`;
  });

  html += '</div>';
  html += '<div class="reply-wrapper hidden">';
  html += '<label class="reply-label">Paste their reply here:</label>';
  html += '<textarea class="reply-textarea" placeholder="Paste their response..."></textarea>';
  html += '<button class="next-suggestions-btn primary-btn hidden">Generate next suggestions</button>';
  html += '</div>';

  block.innerHTML = html;

  const options = block.querySelectorAll('.suggestion-option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      const replyWrapper = block.querySelector('.reply-wrapper');
      const nextBtn = block.querySelector('.next-suggestions-btn');
      replyWrapper.classList.remove('hidden');
      nextBtn.classList.remove('hidden');

      nextBtn.addEventListener('click', () => {
        const replyText = block.querySelector('.reply-textarea').value;
        if (!replyText.trim()) {
          alert('Please paste their reply first');
          return;
        }

        const goal = getSelectedGoal();
        const tone = getConversationTone();
        const newSuggestions = generateNextTextSuggestions(goal, tone);
        const newBlock = createSuggestionBlock(newSuggestions, false);
        elements.suggestionsContainer.appendChild(newBlock);

        newBlock.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    });
  });

  return block;
}

function initializeSuggestions() {
  elements.generateSuggestionsBtn.addEventListener('click', () => {
    const goal = getSelectedGoal();
    if (!goal) {
      alert('Please select a goal first');
      return;
    }

    const conversation = getConversationText();
    if (conversation.length === 0) {
      alert('Please add at least one message to the conversation');
      return;
    }

    elements.suggestionsContainer.innerHTML = '';
    suggestionBlockCount = 0;

    const tone = getConversationTone();
    const suggestions = generateNextTextSuggestions(goal, tone);
    const block = createSuggestionBlock(suggestions, true);
    elements.suggestionsContainer.appendChild(block);
  });

});

elements.signupEmail.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSignup();
  }
});

elements.signupPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSignup();
  }
});

document.querySelector('.filter-tabs').addEventListener('click', handleFilterChange);

initializeSuggestions();

function createConversationLine(speaker = 'me', text = '') {
  conversationLineId++;
  const lineId = conversationLineId;

  const line = document.createElement('div');
  line.className = 'conversation-line';
  line.dataset.lineId = lineId;
  line.innerHTML = `
    <select class="speaker-select">
      <option value="me" ${speaker === 'me' ? 'selected' : ''}>Me</option>
      <option value="them" ${speaker === 'them' ? 'selected' : ''}>Them</option>
    </select>
    <input type="text" class="conversation-input" placeholder="Type a message..." value="${text.replace(/"/g, '&quot;')}" />
    <button class="conversation-delete" aria-label="Delete line">🗑️</button>
    <button class="conversation-add" aria-label="Add line">⬇️</button>
  `;

  const deleteBtn = line.querySelector('.conversation-delete');
  const addBtn = line.querySelector('.conversation-add');

  deleteBtn.addEventListener('click', () => {
    const allLines = elements.conversationLines.querySelectorAll('.conversation-line');
    if (allLines.length > 1) {
      line.remove();
      updateConversationUI();
    }
  });

  addBtn.addEventListener('click', () => {
    createConversationLine();
    updateConversationUI();
  });

  return line;
}

function updateConversationUI() {
  const allLines = elements.conversationLines.querySelectorAll('.conversation-line');
  allLines.forEach(line => line.classList.remove('last'));
  if (allLines.length > 0) {
    allLines[allLines.length - 1].classList.add('last');
  }
}

function toggleMobileMenu() {
  elements.navMenuBtn.classList.toggle('active');
  elements.navbarMobile.classList.toggle('open');
}

function closeMobileMenu() {
  elements.navMenuBtn.classList.remove('active');
  elements.navbarMobile.classList.remove('open');
}

elements.navMenuBtn.addEventListener('click', toggleMobileMenu);

document.querySelectorAll('.navbar-mobile .nav-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

supabase.auth.onAuthStateChange((event, session) => {
  (() => {
    if (session?.user) {
      currentUser = session.user;
      showApp();
    } else {
      showAuth();
    }
  })();
});

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    currentUser = session.user;
    showApp();
  }
});
