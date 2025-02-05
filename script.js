document.addEventListener('DOMContentLoaded', () => {
    console.log('Script initialized');
    
    const propertySelect = document.getElementById('propertySelect');
    const valueControls = document.getElementById('valueControls');
    const demoElement = document.getElementById('demoElement');
    const cssCode = document.getElementById('cssCode');
    
    console.log('Elements found:', {
        propertySelect: !!propertySelect,
        valueControls: !!valueControls,
        demoElement: !!demoElement,
        cssCode: !!cssCode
    });

    const appliedStyles = new Map();

    const propertyControls = {
        'width': { type: 'range', min: '0', max: '1000', step: '1', unit: 'px', default: '200' },
        'height': { type: 'range', min: '0', max: '1000', step: '1', unit: 'px', default: '100' },
        'margin': { type: 'range', min: '0', max: '100', step: '1', unit: 'px', default: '10' },
        'padding': { type: 'range', min: '0', max: '100', step: '1', unit: 'px', default: '10' },
        'border': { type: 'text', placeholder: 'e.g., 1px solid black' },
        'font-size': { type: 'range', min: '8', max: '72', step: '1', unit: 'px', default: '16' },
        'font-weight': { type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
        'font-family': { type: 'select', options: ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'] },
        'text-align': { type: 'select', options: ['left', 'center', 'right', 'justify'] },
        'line-height': { type: 'range', min: '1', max: '3', step: '0.1', unit: '', default: '1.5' },
        'letter-spacing': { type: 'range', min: '-2', max: '10', step: '0.5', unit: 'px', default: '0' },
        'text-decoration': { type: 'select', options: ['none', 'underline', 'overline', 'line-through'] },
        'color': { type: 'color' },
        'background-color': { type: 'color' },
        'background-image': { type: 'text', placeholder: 'e.g., url(image.jpg)' },
        'opacity': { type: 'range', min: '0', max: '1', step: '0.1' },
        'display': { type: 'select', options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] },
        'position': { type: 'select', options: ['static', 'relative', 'absolute', 'fixed'] },
        'float': { type: 'select', options: ['none', 'left', 'right'] },
        'box-shadow': { type: 'text', placeholder: 'e.g., 2px 2px 4px #000' },
        'text-shadow': { type: 'text', placeholder: 'e.g., 1px 1px 2px #000' },
        'border-radius': { type: 'range', min: '0', max: '100', step: '1', unit: 'px', default: '0' },
        'transform': { type: 'select', options: ['none', 'rotate(45deg)', 'scale(1.5)', 'translateX(20px)', 'skew(10deg)'] },
        'transition': { type: 'text', placeholder: 'e.g., all 0.3s ease' }
    };

    function supportsScrolling(property) {
        const scrollableProperties = ['width', 'height', 'margin', 'padding', 'border-radius', 'font-size', 'letter-spacing'];
        return scrollableProperties.includes(property);
    }

    function createValueControl(property) {
        const control = propertyControls[property];
        valueControls.innerHTML = '';

        if (!control) return;

        let input;
        
        switch (control.type) {
            case 'select':
                input = document.createElement('select');
                input.className = 'value-input';
                control.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    input.appendChild(optionElement);
                });
                break;
                
            case 'color':
                input = document.createElement('input');
                input.type = 'color';
                input.className = 'value-input';
                input.value = '#3498db';
                break;
                
            case 'range':
                const container = document.createElement('div');
                container.className = 'range-container';
                
                input = document.createElement('input');
                input.type = 'range';
                input.min = control.min;
                input.max = control.max;
                input.step = control.step;
                input.className = 'value-input';
                input.value = control.default || '0.5';
                
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'value-display';
                valueDisplay.textContent = input.value + (control.unit || '');
                
                input.addEventListener('input', () => {
                    const displayValue = input.value + (control.unit || '');
                    valueDisplay.textContent = displayValue;
                    updateStyle(property, displayValue);
                    
                    if (supportsScrolling(property)) {
                        const container = input.closest('.range-container');
                        if (container) {
                            container.scrollLeft = (input.value / control.max) * (container.scrollWidth - container.clientWidth);
                        }
                    }
                });
                
                container.appendChild(input);
                container.appendChild(valueDisplay);
                valueControls.appendChild(container);
                
                // Set initial value
                const initialValue = input.value + (control.unit || '');
                updateStyle(property, initialValue);
                return input;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.placeholder = control.placeholder;
                input.className = 'value-input';
        }

        input.addEventListener('input', (e) => updateStyle(property, control.unit ? e.target.value + control.unit : e.target.value));
        valueControls.appendChild(input);
        return input;
    }

    function updateStyle(property, value) {
        if (value) {
            appliedStyles.set(property, value);
            demoElement.style[property] = value;
        } else {
            appliedStyles.delete(property);
            demoElement.style[property] = '';
        }
        updateCssCode();
    }

    function updateCssCode() {
        if (appliedStyles.size === 0) {
            cssCode.textContent = '/* No styles applied yet */';
            return;
        }

        let css = '#demoElement {\n';
        appliedStyles.forEach((value, property) => {
            css += `    ${property}: ${value};\n`;
        });
        css += '}';
        cssCode.textContent = css;
    }

    propertySelect.addEventListener('change', (e) => {
        const property = e.target.value;
        console.log('Selected property:', property);
        
        if (!property) {
            valueControls.innerHTML = '';
            return;
        }
        
        // Clear any existing styles when changing properties
        if (appliedStyles.has(property)) {
            appliedStyles.delete(property);
            demoElement.style[property] = '';
        }
        
        const control = createValueControl(property);
        console.log('Created control:', control);
        
        if (control && propertyControls[property].type === 'range') {
            // Trigger initial update for range controls
            const initialValue = control.value + (propertyControls[property].unit || '');
            console.log('Setting initial value:', initialValue);
            updateStyle(property, initialValue);
        }
    });

    // Initialize with empty code
    updateCssCode();
    console.log('Initialization complete');
});
