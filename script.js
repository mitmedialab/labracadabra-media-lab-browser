function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
document.addEventListener('DOMContentLoaded', () => {
    fetch('allprojects.json')
        .then(response => response.json())
        .then(data => {
            const projects = data.projects;
            const years = [...new Set(projects.map(project => {
                let startYear = new Date(project.start_on).getFullYear();
                if (startYear < 1985){
                    startYear = new Date(project.created).getFullYear();
                }
                return isNaN(startYear) ? null : startYear;
            }).filter(year => year !== null))];

            // Sort years in ascending order
            years.sort((a, b) => a - b);

            const yearList = document.getElementById('yearList');
            const projectGrid = document.getElementById('projectGrid');

            years.forEach(year => {
                const li = document.createElement('li');
                li.textContent = year;
                li.classList.add('year-item');
                li.addEventListener('click', () => {
                    setActiveYear(li);
                    displayProjects(year, projects);
                });
                yearList.appendChild(li);
            });

            function setActiveYear(activeLi) {
                document.querySelectorAll('.year-selector li').forEach(item => item.classList.remove('active'));
                activeLi.classList.add('active');
                adjustVerticalPositioning();
            }

            function adjustVerticalPositioning() {
                const yearItems = Array.from(document.querySelectorAll('.year-selector li'));
                const activeItem = document.querySelector('.year-selector li.active');
                const itemHeight = activeItem.offsetHeight;
                console.log(itemHeight);
                console.log(yearList.clientHeight);
                const centerOffset = 0;(yearList.clientHeight / 2) - (itemHeight / 2);

                yearItems.forEach((item, index) => {
                    const offset = index - yearItems.indexOf(activeItem);
                    item.style.transform = `translateY(${offset * itemHeight}px) translateY(${centerOffset}px)`;
                });
            }

            function displayProjects(year, projects) {
                projectGrid.innerHTML = '';
                projects.forEach(project => {
                    const startYear = new Date(project.start_on).getFullYear();

                    if (startYear === year) {
                        const projectContainer = document.createElement('div');
                        projectContainer.classList.add('project-container');
                        const imgURL = project.hero_image_url;

                        if (imgURL) {
                            const img = document.createElement('img');
                            img.src = imgURL;
                            img.alt = project.title;
                            projectContainer.appendChild(img);
                        } else {
                            const grayValue = Math.floor(Math.random() * 256);
                            projectContainer.style.backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
                        }

                        const titleOverlay = document.createElement('div');
                        titleOverlay.classList.add('title-overlay');
                        titleOverlay.textContent = project.title;

                        projectContainer.appendChild(titleOverlay);
                        projectGrid.appendChild(projectContainer);
                    }
                });
            }

            function handleWheel(event) {
                event.preventDefault();

                const yearItems = Array.from(document.querySelectorAll('.year-selector li'));
                const activeIndex = yearItems.findIndex(item => item.classList.contains('active'));

                let newIndex = activeIndex;

                if (event.deltaY > 0) {
                    newIndex = Math.min(yearItems.length - 1, activeIndex + 1);
                } else {
                    newIndex = Math.max(0, activeIndex - 1);
                }

                if (newIndex !== activeIndex) {
                    const newActiveItem = yearItems[newIndex];
                    setActiveYear(newActiveItem);
                    const year = parseInt(newActiveItem.textContent, 10);
                    displayProjects(year, projects);
                }
            }

            // Attach debounced wheel event listener
            yearList.addEventListener('wheel', debounce(handleWheel, 200));

            // Initialize with the first year
            if (years.length > 0) {
                yearList.firstChild.click();
            }
        })
        .catch(error => console.error('Error loading projects:', error));
});