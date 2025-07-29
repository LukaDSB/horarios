document.addEventListener('DOMContentLoaded', () => {
    const routeSelect = document.getElementById('route-select');
    const selectedRouteNameSpan = document.getElementById('selected-route-name');
    const scheduleDisplay = document.getElementById('schedule-display');

    // Variáveis para o menu hambúrguer
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navbarLinks = document.querySelector('.navbar-links');

    // URLs das planilhas (manter as suas URLs reais aqui)
    const ROUTES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=252074480&single=true&output=csv';

    const ROUTE_SCHEDULE_URLS = {
        'Cachoeiro - Guaçui': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=0&single=true&output=csv',
        'Guaçui - Cachoeiro': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=1186337261&single=true&output=csv',
        'Alegre - Rive': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=595993676&single=true&output=csv'
    };

    // Função para carregar as rotas da planilha
    async function loadRoutes() {
        try {
            const response = await fetch(ROUTES_CSV_URL);
            const csvText = await response.text();
            const routes = csvText.split('\n').map(row => row.trim()).filter(row => row);

            routeSelect.innerHTML = '<option value="">Selecione uma rota</option>';
            routes.forEach(route => {
                const option = document.createElement('option');
                option.value = route;
                option.textContent = route;
                routeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar as rotas:', error);
            routeSelect.innerHTML = '<option value="">Erro ao carregar rotas</p>';
        }
    }

    // Função para carregar e exibir os horários da rota selecionada
    async function loadSchedule(routeName) {
        scheduleDisplay.innerHTML = '<p>Carregando horários...</p>';
        selectedRouteNameSpan.textContent = routeName;

        const scheduleUrl = ROUTE_SCHEDULE_URLS[routeName];

        if (!scheduleUrl) {
            scheduleDisplay.innerHTML = '<p>URL de horários não encontrada para esta rota.</p>';
            return;
        }

        try {
            const response = await fetch(scheduleUrl);
            const csvText = await response.text();
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);

            if (lines.length === 0) {
                scheduleDisplay.innerHTML = '<p>Nenhum horário encontrado para esta rota.</p>';
                return;
            }

            const headers = lines[0].split(',').map(header => header.trim());
            const dataRows = lines.slice(1);

            let tableHTML = '<table><thead><tr>';
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';

            dataRows.forEach(row => {
                const columns = row.split(',').map(col => col.trim());
                let rowClass = '';
                if (columns[0].toUpperCase() === 'SÁBADO' || columns[0].toUpperCase() === 'DOMINGO') {
                    rowClass = 'schedule-header-row';
                }

                tableHTML += `<tr class="${rowClass}">`;
                columns.forEach(col => {
                    tableHTML += `<td>${col}</td>`;
                });
                tableHTML += '</tr>';
            });

            tableHTML += '</tbody></table>';
            scheduleDisplay.innerHTML = tableHTML;

        } catch (error) {
            console.error(`Erro ao carregar horários para ${routeName}:`, error);
            scheduleDisplay.innerHTML = '<p>Erro ao carregar os horários. Por favor, tente novamente.</p>';
        }
    }

    // Lógica para o menu hambúrguer
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navbarLinks.classList.toggle('active');
            // Fechar dropdowns ao fechar o menu principal
            if (!navbarLinks.classList.contains('active')) {
                const openSubmenus = document.querySelectorAll('.submenu.show');
                openSubmenus.forEach(submenu => {
                    submenu.classList.remove('show');
                    const arrow = submenu.closest('.dropdown').querySelector('.dropdown-arrow');
                    if (arrow) {
                        arrow.classList.remove('open');
                    }
                });
            }
        });
    }

    // Lógica para os dropdowns da navbar
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a:first-child');
        const submenu = dropdown.querySelector('.submenu');
        const dropdownArrow = dropdown.querySelector('.dropdown-arrow');

        if (dropdownLink) {
            dropdownLink.addEventListener('click', (event) => {
                // Previne a navegação padrão do link para permitir o toggle do submenu
                event.preventDefault(); 

                // Fecha outros dropdowns abertos (apenas para desktop)
                if (window.innerWidth >= 1000) {
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.querySelector('.submenu')?.classList.remove('show');
                            otherDropdown.querySelector('.dropdown-arrow')?.classList.remove('open');
                        }
                    });
                }

                // Alterna a visibilidade do submenu e a rotação da seta
                submenu.classList.toggle('show');
                if (dropdownArrow) {
                    dropdownArrow.classList.toggle('open');
                }
            });
        }
    });

    // Esconde os dropdowns ao clicar fora
    document.addEventListener('click', (event) => {
        // Aplica para todas as telas para garantir que o clique fora feche
        dropdowns.forEach(dropdown => {
            const submenu = dropdown.querySelector('.submenu');
            // Verifica se o clique não foi dentro do dropdown e se o submenu está visível
            if (submenu && !dropdown.contains(event.target) && submenu.classList.contains('show')) {
                submenu.classList.remove('show');
                const arrow = dropdown.querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.classList.remove('open');
                }
            }
        });
    });


    // Event listener para a mudança na seleção da rota
    routeSelect.addEventListener('change', (event) => {
        const selectedRoute = event.target.value;
        if (selectedRoute) {
            loadSchedule(selectedRoute);
            // Opcional: Fechar o menu hambúrguer após selecionar uma rota (se estiver aberto)
            if (navbarLinks && navbarLinks.classList.contains('active')) {
                navbarLinks.classList.remove('active');
            }
            // Fechar todos os dropdowns (se houver) ao selecionar uma rota
            const openSubmenus = document.querySelectorAll('.submenu.show');
            openSubmenus.forEach(submenu => {
                submenu.classList.remove('show');
                const arrow = submenu.closest('.dropdown').querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.classList.remove('open');
                }
            });
        } else {
            scheduleDisplay.innerHTML = '<p>Selecione uma rota para ver os horários.</p>';
            selectedRouteNameSpan.textContent = '';
        }
    });

    // Carrega as rotas ao iniciar a página
    loadRoutes();
});