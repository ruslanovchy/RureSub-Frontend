import { useEffect, useRef, useState } from 'react';
import './CodeInputs.scss'

function CodeInputs({ codeLength, code, setCode, status, setStatus }) {
    const [values, setValues] = useState(Array(codeLength).fill(''));
    const [currentPos, setCurrentPos] = useState(0);
    const [seconds, setSeconds] = useState(60);
    const inputs = useRef([]);

    useEffect(()=>{
        const newValues = new Array(codeLength).fill('');
        code.split('').forEach((c, i) => {
            if (i < newValues.length) {
                newValues[i] = c;
            }
        });
        setValues(newValues);
        const newPos = Math.min(code.length, codeLength);
        setCurrentPos(newPos);
    }, [code]);

    useEffect(()=>{
        if (currentPos >= 0 && 
            currentPos <= codeLength) {
            if (inputs.current.length > currentPos &&
                !!inputs.current[currentPos]) {
                inputs.current[currentPos].focus();
            }
            else if (inputs.current.length >= currentPos &&
                !!inputs.current[currentPos - 1]) {
                inputs.current[currentPos - 1].focus();
            }
        }
    }, [currentPos])

    function update(i, v) {
        let next = [...values];
        next[i] = v;
        setCode(next.join(''));
        setStatus('idle');
    }

    function handleKeyDown(e, i) {
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (values[i]) {
                update(i, '');
            }
            else if (i > 0) {
                update(i - 1, '');
                setCurrentPos(i - 1);
            }
        }
    }

    function handleInput(e, i) {
        const v = e.target.value.replace(/\D/g, "");
        if (!v) { update(i, ''); return; }
        
        if (v.length > 1) {
            const chars = v.split("").slice(0, codeLength);
            const next = values.join('');
            chars.forEach(ch => {
                next.push(ch);
            });
            setCode(next);
            return;
        }

        if (i < codeLength - 1) {
            setCurrentPos(i + 1);
        }
        update(i, v);

        setStatus('idle');
    }

    function handlePaste(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '');
        if (!text) return;
        const chars = text.split('').slice(0, codeLength);
        let next = '';
        chars.forEach((ch, i) => {
            next += ch
        });
        setCode(next);
    }

    function handleOnFocus(e, i) {
        if (i != currentPos) {
            if (inputs.current.length > currentPos) {
                inputs.current[currentPos].focus();
            }
            else if (inputs.current.length == currentPos) {
                inputs.current[currentPos - 1].focus();
            }
        }
    }

    function cellClass(i) {
        const classes = ['cell']
        if (values[i]) classes.push('filled');
        if (status == 'error') classes.push('error');
        else if (status == 'success') classes.push('success');
        return classes.join(' ');
    }

    return (
        <div className="code-inputs-container">
            {values.map((v, i) => (
                <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type='tel'
                    inputMode='numeric'
                    maxLength={1}
                    value={v}
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    className={cellClass(i)}
                    onInput={(e)=>{ handleInput(e, i) }}
                    onFocus={(e)=>{ e.preventDefault(); handleOnFocus(e, i)}}
                    onKeyDown={(e)=>{ handleKeyDown(e, i) }}
                    onPaste={handlePaste}
                    />
            ))}
        </div>
    )
}

export default CodeInputs;