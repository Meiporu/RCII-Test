let questions = [];
let shuffledQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let userAnswers = [];

// Cargar preguntas
fetch('./src/preguntas.json')
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
    shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    currentIndex = 0;
    correctAnswers = 0;
    userAnswers = new Array(shuffledQuestions.length).fill(null);

    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('prev-btn').classList.remove('hidden');
    document.getElementById('skip-btn').classList.remove('hidden');
    document.getElementById('final-result').style.display = 'none';

    showQuestion();
}

function updateProgressBar() {
    const progress = (currentIndex / shuffledQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `Pregunta ${currentIndex + 1} de ${shuffledQuestions.length}`;
}

function showQuestion() {
    if (currentIndex < shuffledQuestions.length) {
        const q = shuffledQuestions[currentIndex];
        updateProgressBar();

        document.getElementById('question').textContent = q.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        document.getElementById('prev-btn').disabled = currentIndex === 0;

        q.options.forEach((option, index) => {
            const optionWrapper = document.createElement('div');
            optionWrapper.className = 'option-wrapper';

            const button = document.createElement('button');
            button.className = 'option';
            button.id = `opt-btn-${index}`;
            button.textContent = option;

            if (userAnswers[currentIndex] !== null) {
                const answer = userAnswers[currentIndex];
                if (index === q.correct) button.classList.add('correct');
                if (index === answer.selectedIndex && !answer.isCorrect) button.classList.add('incorrect');
                button.classList.add('disabled');
            } else {
                button.onclick = () => checkAnswer(index);
            }

            optionWrapper.appendChild(button);
            optionsContainer.appendChild(optionWrapper);
        });

        document.getElementById('skip-btn').classList.toggle('hidden', userAnswers[currentIndex] !== null);
    } else {
        showFinalResult();
    }
}

function checkAnswer(selectedIndex) {
    const correctIndex = shuffledQuestions[currentIndex].correct;
    const isCorrect = selectedIndex === correctIndex;

    userAnswers[currentIndex] = {
        question: shuffledQuestions[currentIndex].question,
        selectedIndex: selectedIndex,
        userAnswer: shuffledQuestions[currentIndex].options[selectedIndex],
        correctAnswer: shuffledQuestions[currentIndex].options[correctIndex],
        isCorrect: isCorrect
    };

    if (isCorrect) {
        document.getElementById(`opt-btn-${selectedIndex}`).classList.add('correct');
        correctAnswers++;
    } else {
        document.getElementById(`opt-btn-${selectedIndex}`).classList.add('incorrect');
        document.getElementById(`opt-btn-${correctIndex}`).classList.add('correct');
    }

    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.add('disabled'));

    setTimeout(() => {
        nextQuestion();
    }, 1200);
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        showQuestion();
    }
}

function skipQuestion() {
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