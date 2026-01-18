let questions = [];
let shuffledQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let userAnswers = [];

// Cargar preguntas
fetch('./src/TestQuestions/3rd-year/RCII.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        document.getElementById('start-btn').disabled = false;
        document.getElementById('start-btn').textContent = 'Empezar Quiz';
        document.getElementById('question').textContent = 'Haz clic en "Empezar Quiz" para comenzar.';
    })
    .catch(error => {
        console.error('Error cargando preguntas:', error);
        document.getElementById('question').textContent = 'Error al cargar las preguntas.';
    });

document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Cargando preguntas...';
    }
});

function startQuiz() {
    if (!questions || questions.length === 0) return;

    // 1. Obtener la cantidad seleccionada
    const countSelect = document.getElementById('question-count');
    const selectedValue = countSelect.value;

    // 2. Mezclar TODAS primero para que la selección sea aleatoria cada vez
    let tempQuestions = [...questions].sort(() => Math.random() - 0.5);

    // 3. Limitar el array según la opción
    if (selectedValue !== 'all') {
        const limit = parseInt(selectedValue);
        shuffledQuestions = tempQuestions.slice(0, limit);
    } else {
        shuffledQuestions = tempQuestions;
    }

    // 4. Inicializar variables de estado con el nuevo tamaño
    currentIndex = 0;
    correctAnswers = 0;
    userAnswers = new Array(shuffledQuestions.length).fill(null);

    // 5. Ocultar configuración y mostrar botones de juego
    document.getElementById('setup-container').classList.add('hidden');
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('prev-btn').classList.remove('hidden');
    document.getElementById('skip-btn').classList.remove('hidden');

    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) sidePanel.classList.remove('hidden');

    showQuestion();
}

function updateQuestionGrid() {
    const grid = document.getElementById('question-grid');
    if (!grid) return;
    grid.innerHTML = '';

    shuffledQuestions.forEach((_, index) => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.textContent = `Pregunta ${index + 1}`;

        if (index === currentIndex) item.classList.add('active');

        const ans = userAnswers[index];
        if (ans !== null) {
            if (ans.selectedIndex !== undefined) {
                item.classList.add(ans.isCorrect ? 'correct-row' : 'incorrect-row');
            } else if (ans.skipped) {
                item.classList.add('skipped-row');
            }
        }

        item.onclick = () => {
            currentIndex = index;
            showQuestion();
        };
        grid.appendChild(item);
    });
}

function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    if (progressFill && progressText) {
        const progress = (currentIndex / shuffledQuestions.length) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Pregunta ${currentIndex + 1} de ${shuffledQuestions.length}`;
    }
}

function updateQuestionGrid() {
    const grid = document.getElementById('question-grid');
    if (!grid) return;
    grid.innerHTML = '';

    shuffledQuestions.forEach((_, index) => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.textContent = `Pregunta ${index + 1}`;

        if (index === currentIndex) {
            item.classList.add('active');
        }

        const answer = userAnswers[index];
        if (answer !== null) {
            if (answer.selectedIndex !== undefined) {
                item.classList.add('answered');
                if (answer.isCorrect) {
                    item.classList.add('correct-row');
                } else {
                    item.classList.add('incorrect-row');
                }
            }
            else if (answer.skipped) {
                item.classList.add('skipped-row');
            }
        }

        item.onclick = () => {
            currentIndex = index;
            showQuestion();
        };
        grid.appendChild(item);
    });
}

function showQuestion() {
    if (currentIndex < shuffledQuestions.length) {
        updateProgressBar();
        updateQuestionGrid();

        const q = shuffledQuestions[currentIndex];
        document.getElementById('question').textContent = q.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        const isDefinitive = userAnswers[currentIndex] !== null && userAnswers[currentIndex].selectedIndex !== undefined;

        q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.id = `opt-btn-${index}`;
            button.textContent = option;

            if (isDefinitive) {
                const ans = userAnswers[currentIndex];
                if (index === q.correct) button.classList.add('correct');
                if (index === ans.selectedIndex && !ans.isCorrect) button.classList.add('incorrect');
                button.classList.add('disabled');
            } else {
                button.onclick = () => checkAnswer(index);
            }
            optionsContainer.appendChild(button);
        });

        document.getElementById('skip-btn').textContent = isDefinitive ? "Siguiente" : "Saltar";
    } else {
        showFinalResult();
    }
}

function checkAnswer(selectedIndex) {
    const correctIndex = shuffledQuestions[currentIndex].correct;
    const isCorrect = selectedIndex === correctIndex;

    userAnswers[currentIndex] = {
        selectedIndex: selectedIndex,
        isCorrect: isCorrect,
        userAnswer: shuffledQuestions[currentIndex].options[selectedIndex],
        correctAnswer: shuffledQuestions[currentIndex].options[correctIndex],
        question: shuffledQuestions[currentIndex].question
    };

    if (isCorrect) {
        document.getElementById(`opt-btn-${selectedIndex}`).classList.add('correct');
        correctAnswers++;
    } else {
        document.getElementById(`opt-btn-${selectedIndex}`).classList.add('incorrect');
        document.getElementById(`opt-btn-${correctIndex}`).classList.add('correct');
    }

    document.querySelectorAll('.option').forEach(btn => btn.classList.add('disabled'));
    updateQuestionGrid();

    setTimeout(() => { nextQuestion(); }, 1200);
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        showQuestion();
    }
}

function skipQuestion() {
    if (userAnswers[currentIndex] === null || userAnswers[currentIndex].selectedIndex === undefined) {
        userAnswers[currentIndex] = { skipped: true };
    }
    currentIndex++;
    showQuestion();
}

function nextQuestion() {
    currentIndex++;
    showQuestion();
}

function showFinalResult() {
    document.getElementById('question').textContent = 'Quiz Finalizado';
    document.getElementById('options').innerHTML = '';
    document.getElementById('prev-btn').classList.add('hidden');
    document.getElementById('skip-btn').classList.add('hidden');

    const finalResult = document.getElementById('final-result');
    const scorePercent = Math.round((correctAnswers / shuffledQuestions.length) * 100);

    finalResult.innerHTML = `
        <h2>Resultado</h2>
        <p>Has acertado ${correctAnswers} de ${shuffledQuestions.length}</p>
        <p style="font-size: 32px; color: ${scorePercent >= 50 ? '#1abc9c' : '#ff4444'};">${scorePercent}%</p>
        <button id="review-btn" class="option" style="margin-top:20px">Revisar respuestas</button>
    `;
    finalResult.style.display = 'block';

    document.getElementById('review-btn').onclick = () => reviewAnswers();
}

function reviewAnswers() {
    let reviewHTML = '<h3>Revisión Detallada</h3>';
    userAnswers.forEach((answer, index) => {
        if (answer) {
            reviewHTML += `
                <div style="margin: 10px 0; padding: 10px; border: 1px solid ${answer.isCorrect ? '#1abc9c' : '#ff4444'}; border-radius: 8px; text-align: left;">
                    <p><strong>${index + 1}. ${answer.question}</strong></p>
                    <p>Tu respuesta: <span style="color: ${answer.isCorrect ? '#1abc9c' : '#ff4444'}">${answer.userAnswer}</span></p>
                    ${!answer.isCorrect ? `<p>Correcta: <span style="color: #1abc9c">${answer.correctAnswer}</span></p>` : ''}
                </div>`;
        }
    });
    document.getElementById('final-result').innerHTML = reviewHTML;
}