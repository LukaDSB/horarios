document.addEventListener('DOMContentLoaded', () => {
    const routeSelect = document.getElementById('route-select');
    const selectedRouteNameSpan = document.getElementById('selected-route-name');
    const scheduleDisplay = document.getElementById('schedule-display');

    const ROUTES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=252074480&single=true&output=csv';

    const ROUTE_SCHEDULE_URLS = {
        'Cachoeiro - Guaçui': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=0&single=true&output=csv',
        'Guaçui - Cachoeiro': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=1186337261&single=true&output=csv',
        'Alegre - Rive': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFRpBHlrOcNxYjeM8dAnA-WdSRal1gRQIvplcWayT0XbhYlUzJKak0OXPJkMhtvkYbc5xV4OLW1tB/pub?gid=595993676&single=true&output=csv'
    };

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
            routeSelect.innerHTML = '<option value="">Erro ao carregar rotas</option>';
        }
    }

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

    routeSelect.addEventListener('change', (event) => {
        const selectedRoute = event.target.value;
        if (selectedRoute) {
            loadSchedule(selectedRoute);
        } else {
            scheduleDisplay.innerHTML = '<p>Selecione uma rota para ver os horários.</p>';
            selectedRouteNameSpan.textContent = '';
        }
    });

    loadRoutes();
});