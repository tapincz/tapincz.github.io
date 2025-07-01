document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bac-calculator');
    const resultsSection = document.getElementById('results');
    const bacValueElement = document.getElementById('bac-value');
    const soberTimeElement = document.getElementById('sober-time');
    const soberDateElement = document.getElementById('sober-date');
    const warningLevelElement = document.getElementById('warning-level');
    const drinksContainer = document.getElementById('drinks-container');
    const addDrinkButton = document.getElementById('add-drink');
    
    // Přidání prvního nápoje při načtení stránky
    addDrink();
    
    // Přidání nápoje
    addDrinkButton.addEventListener('click', addDrink);
    
    // Odeslání formuláře
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBAC();
    });
    
    function addDrink() {
        const drinkRow = document.createElement('div');
        drinkRow.className = 'drink-input-row';
        
        drinkRow.innerHTML = `
            <select class="drink-type" required>
                <option value="">Vyberte nápoj</option>
                <option value="beer_10">0,5 l piva 10° (~20 g alkoholu)</option>
                <option value="beer_12">0,5 l piva 12° (~25 g alkoholu)</option>
                <option value="wine">1 dcl vína (~10 g alkoholu)</option>
                <option value="spirit">0,04 l tvrdého alkoholu (~12.6 g alkoholu)</option>
                <option value="custom">Vlastní nápoj</option>
            </select>
            <input type="number" class="drink-amount" min="1" value="1" required>
            <button type="button" class="btn-remove">×</button>
        `;
        
        drinksContainer.appendChild(drinkRow);
        
        // Přidání event listeneru pro odstranění nápoje
        const removeButton = drinkRow.querySelector('.btn-remove');
        removeButton.addEventListener('click', function() {
            drinksContainer.removeChild(drinkRow);
        });
        
        // Přidání event listeneru pro vlastní nápoj
        const drinkTypeSelect = drinkRow.querySelector('.drink-type');
        drinkTypeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                const amountInput = drinkRow.querySelector('.drink-amount');
                amountInput.placeholder = 'Množství alkoholu v gramech';
                amountInput.value = '';
            }
        });
    }
    
    function calculateBAC() {
        // Získání osobních údajů
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseInt(document.getElementById('height').value);
        const hoursDrinking = parseFloat(document.getElementById('hours-drinking').value);
        
        // Výpočet distribučního koeficientu (r)
        const r = gender === 'male' ? 0.68 : 0.55;
        
        // Výpočet celkového množství alkoholu (A)
        let totalAlcohol = 0;
        const drinkRows = document.querySelectorAll('.drink-input-row');
        
        drinkRows.forEach(row => {
            const drinkType = row.querySelector('.drink-type').value;
            const drinkAmount = parseFloat(row.querySelector('.drink-amount').value);
            
            switch(drinkType) {
                case 'beer_10':
                    totalAlcohol += 20 * drinkAmount;
                    break;
                case 'beer_12':
                    totalAlcohol += 25 * drinkAmount;
                    break;
                case 'wine':
                    totalAlcohol += 10 * drinkAmount;
                    break;
                case 'spirit':
                    totalAlcohol += 12.6 * drinkAmount;
                    break;
                case 'custom':
                    totalAlcohol += drinkAmount;
                    break;
            }
        });
        
        // Widmarkova formule
        const beta = 0.15; // rychlost odbourávání alkoholu (g/l/h)
        const bac = ((totalAlcohol * 0.789) / (r * weight)) - (beta * hoursDrinking);
        
        // Zobrazení výsledků
        displayResults(Math.max(0, bac), totalAlcohol, r, weight);
    }
    
    function displayResults(bac, totalAlcohol, r, weight) {
        // Zaokrouhlení na 2 desetinná místa
        const roundedBAC = Math.round(bac * 100) / 100;
        
        // Zobrazení hodnoty BAC
        bacValueElement.textContent = roundedBAC.toFixed(2);
        
        // Výpočet doby odbourání (v hodinách)
        const eliminationTime = roundedBAC / 0.15;
        const hours = Math.floor(eliminationTime);
        const minutes = Math.round((eliminationTime - hours) * 60);
        
        let soberTimeText = '';
        if (hours > 0) {
            soberTimeText += `${hours} hodin${hours === 1 ? 'a' : hours < 5 ? 'y' : ''}`;
        }
        if (minutes > 0) {
            if (hours > 0) soberTimeText += ' a ';
            soberTimeText += `${minutes} minut${minutes === 1 ? 'y' : minutes < 5 ? 'y' : ''}`;
        }
        
        soberTimeElement.textContent = soberTimeText || 'méně než 1 hodina';
        
        // Výpočet předpokládaného času střízlivění
        const now = new Date();
        const soberDate = new Date(now.getTime() + eliminationTime * 60 * 60 * 1000);
        
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'numeric'
        };
        
        soberDateElement.textContent = soberDate.toLocaleDateString('cs-CZ', options);
        
        // Nastavení varování podle úrovně BAC
        let warningText = '';
        let warningClass = '';
        
        if (roundedBAC <= 0.2) {
            warningText = 'Hladina alkoholu v krvi je velmi nízká. I tak může ovlivnit vaše schopnosti, zejména při řízení vozidla.';
            warningClass = 'info';
        } else if (roundedBAC <= 0.5) {
            warningText = 'Hladina alkoholu v krvi je zvýšená. Můžete pociťovat mírnou euforii a uvolnění, ale také sníženou schopnost úsudku. Řízení vozidla je nebezpečné a nezákonné.';
            warningClass = 'warning';
        } else if (roundedBAC <= 1.0) {
            warningText = 'Hladina alkoholu v krvi je výrazně zvýšená. Vaše motorické schopnosti a reakční čas jsou výrazně sníženy. Řízení vozidla je extrémně nebezpečné.';
            warningClass = 'danger';
        } else if (roundedBAC <= 2.0) {
            warningText = 'Hladina alkoholu v krvi je vysoká. Jste výrazně opilí, s narušenou koordinací a úsudkem. Můžete být ohroženi otravou alkoholem. Vyhledejte bezpečné místo k odpočinku.';
            warningClass = 'danger';
        } else {
            warningText = 'Hladina alkoholu v krvi je velmi vysoká. Jste v ohrožení otravou alkoholem, která může být životu nebezpečná. Pokud je někdo v bezvědomí, okamžitě volejte záchrannou službu (155).';
            warningClass = 'emergency';
        }
        
        warningLevelElement.innerHTML = `
            <h3>${getWarningTitle(roundedBAC)}</h3>
            <p>${warningText}</p>
        `;
        
        // Nastavení třídy pro barevné odlišení
        warningLevelElement.className = 'warning-box';
        if (warningClass === 'warning') {
            warningLevelElement.style.borderLeftColor = 'var(--warning-color)';
            warningLevelElement.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
        } else if (warningClass === 'danger') {
            warningLevelElement.style.borderLeftColor = 'var(--danger-color)';
            warningLevelElement.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        } else if (warningClass === 'emergency') {
            warningLevelElement.style.borderLeftColor = 'var(--danger-color)';
            warningLevelElement.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        } else {
            warningLevelElement.style.borderLeftColor = 'var(--success-color)';
            warningLevelElement.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        }
        
        // Zobrazení výsledkové sekce
        resultsSection.style.display = 'block';
        
        // Scroll k výsledkům
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function getWarningTitle(bac) {
        if (bac <= 0.2) return 'Nízká hladina alkoholu';
        if (bac <= 0.5) return 'Zvýšená hladina alkoholu';
        if (bac <= 1.0) return 'Výrazně zvýšená hladina alkoholu';
        if (bac <= 2.0) return 'Vysoká hladina alkoholu';
        return 'Velmi vysoká hladina alkoholu - nebezpečí otravy!';
    }
});
