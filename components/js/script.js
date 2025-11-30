document.addEventListener("DOMContentLoaded", () => {

    /**
     * ЛАБ 5: Функція завантаження даних (AJAX / Fetch API)
     */
    async function loadResumeData() {
        try {
            // 1. Виконуємо запит до файлу data.json
            const response = await fetch('data/data.json');

            // Перевірка на помилку HTTP
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 2. Перетворення відповіді у JSON-об'єкт
            const data = await response.json();

            // 3. Виклик функцій відображення з отриманими даними
            displayUserName(data.person);
            generateExpertise(data.expertise);

        } catch (error) {
            console.error('Помилка завантаження даних:', error);
            // Відображення повідомлення про помилку користувачеві (Завдання 2)
            const expertiseContainer = document.getElementById("expertise-container");
            const nameContainer = document.getElementById("personName");

            if (expertiseContainer) {
                expertiseContainer.innerHTML = `<p style="color: red;">Дані не завантажено. Спробуйте пізніше.</p>`;
            }
            if (nameContainer) {
                nameContainer.textContent = "Error loading name";
            }
        }
    }


    /**
     * ЛАБ 5 (Оновлено): Підстановка імені з об'єкта
     */
    function displayUserName(person) {
        const element = document.getElementById("personName");
        if (element && person) {
            // Формуємо повне ім'я з полів JSON
            element.textContent = `${person.firstName} ${person.lastName}`;
        }
    }


    /**
     * ЛАБ 5 (Оновлено): Генерація навичок з масиву
     */
    function generateExpertise(dataArray) {
        const container = document.getElementById("expertise-container");
        if (!container || !dataArray) return;

        const radius = 36;
        const circumference = 2 * Math.PI * radius;

        container.innerHTML = "";

        dataArray.forEach(item => {
            const offset = circumference - (item.progress / 100) * circumference;

            const itemHtml = `
                <div class="expertise-item">
                    <div class="expertise-circle ${item.class} mb-2">
                        <svg viewBox="0 0 85 85">
                            <circle class="circle-track" cx="42.5" cy="42.5" r="${radius}"></circle>
                            <circle 
                                class="circle-progress" 
                                cx="42.5" cy="42.5" r="${radius}"
                                stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${offset}"
                            ></circle>
                        </svg>
                        <span class="fw-bold">${item.name}</span>
                    </div>
                </div>
            `;
            container.innerHTML += itemHtml;
        });
    }



    function setupCollapsibles() {
        const triggers = document.querySelectorAll(".collapsible-trigger");

        triggers.forEach(trigger => {
            trigger.addEventListener("click", () => {
                const content = trigger.nextElementSibling;
                const arrow = trigger.querySelector(".toggle-arrow");

                if (content && arrow) {
                    content.classList.toggle("hidden");
                    arrow.classList.toggle("rotated");
                }
            });
        });
    }




    // 1. Запускаємо логіку згортання (статична)
    setupCollapsibles();

    // 2. Завантажуємо дані з сервера (динамічні)
    loadResumeData();

});