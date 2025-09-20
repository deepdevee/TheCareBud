document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    // --- FUN FACTS LOGIC ---
    const funFacts = [
        "Smiling, even a fake one, can improve your mood.", "Spending time in nature can reduce stress, anxiety, and depression.",
        "Getting just 20 minutes of exercise can improve your mood for up to 12 hours.", "Dark chocolate is rich in antioxidants and can help reduce stress hormones.",
        "Listening to calming music has been shown to lower blood pressure and anxiety.", "Deep breathing exercises can instantly help calm your nervous system.",
        "Gratitude journaling can significantly increase your feelings of happiness and well-being."
    ];
    const funFactContainer = document.getElementById('fun-fact-container');
    if (funFactContainer) {
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        funFactContainer.querySelector('p').textContent = randomFact;
    }
    // --- AI CHAT LOGIC ---
    const letsTalkButton = document.getElementById('letstalk-button');
    const closeChatButton = document.getElementById('close-chat');
    const chatNavButton = document.getElementById('chat-nav-button');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    function openChat() { body.classList.add('ai-chat-active'); }
    function closeChat() { body.classList.remove('ai-chat-active'); }
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        if (sender === 'user') {
            messageElement.className = 'flex gap-3 items-start justify-end animate-fade-in-up';
            messageElement.innerHTML = `<div class="p-3 rounded-lg rounded-tr-none bg-primary text-white max-w-lg"><p class="text-sm">${text}</p></div>`;
        } else { // Assistant
            messageElement.className = 'flex gap-3 items-start animate-fade-in-up';
            messageElement.innerHTML = `<div class="size-8 rounded-full flex-shrink-0 bg-white/50 overflow-hidden mt-1"><img src="duck_chat_logo.png" alt="Duck Logo" class="h-full w-full object-cover"></div><div class="p-3 rounded-lg rounded-tl-none bg-primary/10 dark:bg-primary/20 max-w-lg"><p class="text-sm">${text}</p></div>`;
        }
        if(chatMessages) {
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    function startChatWithContext(context) {
        if (!chatMessages) return;
        const savedMood = localStorage.getItem('thecarebud_mood_today');
        if (savedMood) {
            context = savedMood;
            localStorage.removeItem('thecarebud_mood_today');
        }
        chatMessages.innerHTML = '';
        let firstMessage = "Hello! I'm your wellness companion. How can I help you today?";
        switch (context) {
            case 'Happy': firstMessage = "That's wonderful to hear! What's putting a smile on your face today?"; break;
            case 'Neutral': firstMessage = "Thanks for checking in. Is there anything on your mind, or something you'd like to explore?"; break;
            case 'Sad': firstMessage = "I'm sorry you're feeling this way. I'm here to listen if you'd like to talk about what's on your mind."; break;
        }
        addMessage(firstMessage, 'assistant');
        openChat();
    }
    if (letsTalkButton) letsTalkButton.addEventListener('click', () => startChatWithContext('general'));
    if (chatNavButton) chatNavButton.addEventListener('click', (e) => { e.preventDefault(); startChatWithContext('general'); });
    if (closeChatButton) closeChatButton.addEventListener('click', closeChat);
    if (chatForm) {
        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;
            addMessage(message, 'user');
            chatInput.value = '';
            chatInput.disabled = true;
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message }),
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                addMessage(data.reply, 'assistant');
            } catch (error) {
                console.error('Error:', error);
                addMessage('Sorry, I seem to be having trouble connecting. Please try again later.', 'assistant');
            } finally {
                chatInput.disabled = false;
                chatInput.focus();
            }
        });
    }
    // --- WIDGETS AND MODALS LOGIC ---
    const journalModal = document.getElementById('journal-modal');
    const eventModal = document.getElementById('event-modal');
    function openModal(modal) { body.classList.add('modal-open'); }
    function closeModal(modal) { body.classList.remove('modal-open'); }
    const meditationTimerDisplay = document.getElementById('meditation-timer');
    const startMeditationBtn = document.getElementById('start-meditation');
    const resetMeditationBtn = document.getElementById('reset-meditation');
    let meditationInterval, meditationSeconds = 300, isMeditating = false;
    function updateMeditationTimer() {
        if(!meditationTimerDisplay) return;
        const minutes = Math.floor(meditationSeconds / 60).toString().padStart(2, '0');
        const seconds = (meditationSeconds % 60).toString().padStart(2, '0');
        meditationTimerDisplay.textContent = `${minutes}:${seconds}`;
    }
    if (startMeditationBtn) {
        startMeditationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMeditating = !isMeditating;
            startMeditationBtn.innerHTML = `<span class="material-symbols-outlined">${isMeditating ? 'pause' : 'play_arrow'}</span>`;
            if (isMeditating) {
                meditationInterval = setInterval(() => {
                    meditationSeconds--;
                    updateMeditationTimer();
                    if (meditationSeconds <= 0) {
                        clearInterval(meditationInterval);
                        isMeditating = false;
                        meditationSeconds = 300;
                        updateMeditationTimer();
                        startMeditationBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`;
                    }
                }, 1000);
            } else {
                clearInterval(meditationInterval);
            }
        });
    }
    if (resetMeditationBtn) {
        resetMeditationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearInterval(meditationInterval);
            isMeditating = false;
            meditationSeconds = 300;
            updateMeditationTimer();
            startMeditationBtn.innerHTML = `<span class="material-symbols-outlined">replay</span>`;
        });
    }
    const journalTextarea = document.getElementById('journal-textarea');
    const newJournalEntryBtn = document.getElementById('new-journal-entry');
    const closeJournalModalBtn = document.getElementById('close-journal-modal');
    const saveJournalEntryBtn = document.getElementById('save-journal-entry');
    if (newJournalEntryBtn) newJournalEntryBtn.addEventListener('click', () => openModal(journalModal));
    if (closeJournalModalBtn) closeJournalModalBtn.addEventListener('click', () => closeModal(journalModal));
    if (saveJournalEntryBtn) saveJournalEntryBtn.addEventListener('click', () => {
        const entry = journalTextarea.value;
        if (entry.trim()) {
            let entries = JSON.parse(localStorage.getItem('thecarebud_journal') || '[]');
            entries.push({ date: new Date().toISOString(), text: entry });
            localStorage.setItem('thecarebud_journal', JSON.stringify(entries));
            alert('Journal entry saved!');
        }
        journalTextarea.value = '';
        closeModal(journalModal);
    });
    const hydrationCount = document.getElementById('hydration-count');
    const hydrationIncrement = document.getElementById('hydration-increment');
    const hydrationDecrement = document.getElementById('hydration-decrement');
    if (hydrationCount) {
        let glasses = parseInt(localStorage.getItem('thecarebud_hydration') || '0');
        hydrationCount.textContent = glasses;
        if (hydrationIncrement) hydrationIncrement.addEventListener('click', () => {
            glasses++;
            hydrationCount.textContent = glasses;
            localStorage.setItem('thecarebud_hydration', glasses);
        });
        if (hydrationDecrement) hydrationDecrement.addEventListener('click', () => {
            if (glasses > 0) {
                glasses--;
                hydrationCount.textContent = glasses;
                localStorage.setItem('thecarebud_hydration', glasses);
            }
        });
    }
    const moodEmojis = document.querySelectorAll('.mood-emoji');
    moodEmojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
            const mood = emoji.dataset.mood;
            localStorage.setItem('thecarebud_mood_today', mood);
            moodEmojis.forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
        });
    });
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('calendar-month-year');
    const eventList = document.getElementById('event-list');
    const eventDateInput = document.getElementById('event-date');
    const eventIdInput = document.getElementById('event-id');
    const eventTitleInput = document.getElementById('event-title');
    const eventTimeInput = document.getElementById('event-time');
    const deleteEventBtn = document.getElementById('delete-event');
    const calendarPrevBtn = document.getElementById('calendar-prev');
    const calendarNextBtn = document.getElementById('calendar-next');
    const newEventBtn = document.getElementById('new-event-btn');
    const closeEventModalBtn = document.getElementById('close-event-modal');
    const saveEventBtn = document.getElementById('save-event');
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('thecarebud_events')) || {};
    function saveEvents() { localStorage.setItem('thecarebud_events', JSON.stringify(events)); }
    function generateCalendar(date) {
        if(!calendarGrid) return;
        calendarGrid.innerHTML = '';
        const month = date.getMonth(), year = date.getFullYear();
        if(monthYearDisplay) monthYearDisplay.textContent = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
            const header = document.createElement('div');
            header.className = 'font-medium text-text-light/60 dark:text-text-dark/60';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });
        for (let i = 0; i < firstDayOfMonth; i++) calendarGrid.appendChild(document.createElement('div'));
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dayCell.textContent = i;
            dayCell.className = 'cursor-pointer hover:bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center mx-auto relative transition-colors';
            dayCell.dataset.date = fullDate;
            if (events[fullDate]?.length) {
                dayCell.innerHTML += '<span class="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>';
            }
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('bg-primary', 'text-white');
            }
            dayCell.addEventListener('click', () => showEventsForDate(fullDate));
            calendarGrid.appendChild(dayCell);
        }
    }
    function showEventsForDate(date) {
        if(!eventList) return;
        eventList.innerHTML = '';
        document.querySelectorAll('#calendar-grid div[data-date]').forEach(d => d.classList.remove('bg-primary/40'));
        document.querySelector(`[data-date='${date}']`)?.classList.add('bg-primary/40');
        if (events[date]?.length) {
            events[date].forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = 'flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 cursor-pointer';
                eventEl.innerHTML = `<div><h4 class="font-semibold">${event.title}</h4><p class="text-sm text-text-light/80">${event.time || ''}</p></div>`;
                eventEl.addEventListener('click', () => openEventModal(date, event));
                eventList.appendChild(eventEl);
            });
        } else {
            eventList.innerHTML = `<p class="text-sm text-center text-text-light/60 dark:text-text-dark/60">No events for this day.</p>`;
        }
    }
    function openEventModal(date, event = null) {
        openModal(eventModal);
        eventDateInput.value = date;
        if (event) {
            eventTitleInput.value = event.title; eventTimeInput.value = event.time; eventIdInput.value = event.id;
            deleteEventBtn.classList.remove('hidden');
        } else {
            eventTitleInput.value = ''; eventTimeInput.value = ''; eventIdInput.value = '';
            deleteEventBtn.classList.add('hidden');
        }
    }
    if(calendarPrevBtn) calendarPrevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); generateCalendar(currentDate); });
    if(calendarNextBtn) calendarNextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); generateCalendar(currentDate); });
    if(newEventBtn) newEventBtn.addEventListener('click', () => openEventModal(new Date().toISOString().split('T')[0]));
    if(closeEventModalBtn) closeEventModalBtn.addEventListener('click', () => closeModal(eventModal));
    if(saveEventBtn) saveEventBtn.addEventListener('click', () => {
        const date = eventDateInput.value, id = eventIdInput.value;
        const newEvent = { id: id ? parseInt(id) : Date.now(), title: eventTitleInput.value, time: eventTimeInput.value };
        if (!events[date]) events[date] = [];
        if (id) {
            const index = events[date].findIndex(e => e.id === newEvent.id);
            events[date][index] = newEvent;
        } else { events[date].push(newEvent); }
        saveEvents();
        closeModal(eventModal);
        generateCalendar(currentDate);
        showEventsForDate(date);
    });
    if(deleteEventBtn) deleteEventBtn.addEventListener('click', () => {
        const date = eventDateInput.value, id = parseInt(eventIdInput.value);
        events[date] = events[date].filter(e => e.id !== id);
        if (!events[date].length) delete events[date];
        saveEvents();
        closeModal(eventModal);
        generateCalendar(currentDate);
        showEventsForDate(date);
    });
    // Initial Load
    generateCalendar(currentDate);
    showEventsForDate(new Date().toISOString().split('T')[0]);
});
