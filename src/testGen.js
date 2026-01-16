let questions = [];

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
                document.getElementById('question').textContent = 'Error al cargar las preguntas. Recarga la página.';
                document.getElementById('start-btn').disabled = true;
            });

        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('start-btn').disabled = true;
            document.getElementById('start-btn').textContent = 'Cargando preguntas...';
        });

        let shuffledQuestions = [];
        let currentIndex = 0;
        let correctAnswers = 0;
        let userAnswers = [];

        function startQuiz() {
            if (!questions || questions.length === 0) {
                alert('Las preguntas aún no se han cargado. Intenta de nuevo en unos segundos.');
                return;
            }
            shuffledQuestions = [...questions].sort(() => Math.random() - 0.5); 
            currentIndex = 0;
            correctAnswers = 0;
            userAnswers = [];
            document.getElementById('start-btn').classList.add('hidden');
            document.getElementById('final-result').style.display = 'none';
            
            showQuestion();
        }

        function showQuestion() {
            if (currentIndex < shuffledQuestions.length) {
                const q = shuffledQuestions[currentIndex];
                if (!q || !q.options) {
                    console.error('Pregunta inválida:', q);
                    return;
                }
                
                // Actualizar barra de progreso
                updateProgressBar();
                
                document.getElementById('question').textContent = q.question;
                const optionsContainer = document.getElementById('options');
                optionsContainer.innerHTML = '';
                q.options.forEach((option, index) => {
                    const optionWrapper = document.createElement('div');
                    optionWrapper.className = 'option-wrapper';
                    optionWrapper.id = `option-${index}`;
                    
                    const button = document.createElement('button');
                    button.className = 'option';
                    button.textContent = option;
                    button.onclick = () => checkAnswer(index);
                    
                    optionWrapper.appendChild(button);
                    optionsContainer.appendChild(optionWrapper);
                });
                document.getElementById('result').style.display = 'none';
                document.getElementById('next-btn').classList.add('hidden');
            } else {
                showFinalResult();
            }
        }

        function updateProgressBar() {
            const progress = (currentIndex / shuffledQuestions.length) * 100;
            document.getElementById('progress-fill').style.width = progress + '%';
            document.getElementById('progress-text').textContent = `Pregunta ${currentIndex + 1} de ${shuffledQuestions.length}`;
        }

        function checkAnswer(selectedIndex) {
            userAnswers.push({
                question: shuffledQuestions[currentIndex].question,
                userAnswer: shuffledQuestions[currentIndex].options[selectedIndex],
                correctAnswer: shuffledQuestions[currentIndex].options[shuffledQuestions[currentIndex].correct],
                isCorrect: selectedIndex === shuffledQuestions[currentIndex].correct
            });
            
            if (selectedIndex === shuffledQuestions[currentIndex].correct) {
                correctAnswers++;
            }
            
            const options = document.querySelectorAll('.option');
            options.forEach(option => option.classList.add('disabled'));
            
            setTimeout(() => {
                nextQuestion();
            }, 1500);
        }

        function nextQuestion() {
            currentIndex++;
            showQuestion();
        }

        function showFinalResult() {
            document.getElementById('question').textContent = '';
            document.getElementById('options').innerHTML = '';
            document.getElementById('result').style.display = 'none';
            const finalResult = document.getElementById('final-result');
            finalResult.innerHTML = `
                <h2>Quiz completado</h2>
                <p><strong>Respuestas correctas: ${correctAnswers} de ${shuffledQuestions.length}</strong></p>
                <p style="font-size: 24px; color: ${correctAnswers / shuffledQuestions.length >= 0.5 ? 'green' : 'red'};">
                    ${Math.round((correctAnswers / shuffledQuestions.length) * 100)}%
                </p>
                <button id="review-btn" style="margin: 10px; padding: 10px 20px; font-size: 16px;">Revisar respuestas</button>
            `;
            finalResult.style.display = 'block';
            document.getElementById('next-btn').classList.add('hidden');
            document.getElementById('restart-btn').classList.remove('hidden');
            
            document.getElementById('review-btn').onclick = () => reviewAnswers();
        }

        function reviewAnswers() {
            let reviewHTML = '<h2>Revisión de respuestas</h2>';
            userAnswers.forEach((answer, index) => {
                reviewHTML += `
                    <div style="margin: 15px 0; padding: 10px; border-left: 4px solid ${answer.isCorrect ? 'green' : 'red'};">
                        <p><strong>Pregunta ${index + 1}:</strong> ${answer.question}</p>
                        <p><strong>Tu respuesta:</strong> ${answer.userAnswer} ${answer.isCorrect ? '✓' : '✗'}</p>
                        ${!answer.isCorrect ? `<p><strong>Respuesta correcta:</strong> ${answer.correctAnswer}</p>` : ''}
                    </div>
                `;
            });
            reviewHTML += '<button id="back-btn" style="margin-top: 20px; padding: 10px 20px; font-size: 16px;">Volver</button>';
            
            const finalResult = document.getElementById('final-result');
            finalResult.innerHTML = reviewHTML;
            
            document.getElementById('back-btn').onclick = () => {
                showFinalResult();
            };
        }

        function restartQuiz() {
            document.getElementById('restart-btn').classList.add('hidden');
            document.getElementById('start-btn').classList.remove('hidden');
            document.getElementById('question').textContent = 'Haz clic en "Empezar Quiz" para comenzar.';
            document.getElementById('final-result').style.display = 'none';
        }
