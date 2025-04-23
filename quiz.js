// Компонент для отдельного вопроса
function QuestionInput({ index, value, onChange, onRemove }) {
    return (
        <div className="form-group question-group">
            <label htmlFor={`question-${index}`}>Вопрос {index + 1}:</label>
            <div className="question-input-container">
                <input
                    type="text"
                    id={`question-${index}`}
                    className="quiz-input"
                    placeholder="Введите вопрос"
                    value={value}
                    onChange={(e) => onChange(index, e.target.value)}
                />
                {index > 0 && (
                    <button 
                        className="remove-question-btn"
                        onClick={() => onRemove(index)}
                        title="Удалить вопрос"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

// Основной компонент для списка вопросов
function QuestionsList() {
    const [questions, setQuestions] = React.useState(['']);
    const [useUnanswered, setUseUnanswered] = React.useState(false);

    const addQuestion = () => {
        setQuestions([...questions, '']);
    };

    const updateQuestion = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    return (
        <div className="questions-container">
            {questions.map((question, index) => (
                <QuestionInput
                    key={index}
                    index={index}
                    value={question}
                    onChange={updateQuestion}
                    onRemove={removeQuestion}
                />
            ))}
            <button className="add-question-btn" onClick={addQuestion}>
                + Добавить вопрос
            </button>
            <div className="unanswered-checkbox">
                <input
                    type="checkbox"
                    id="use-unanswered"
                    checked={useUnanswered}
                    onChange={(e) => setUseUnanswered(e.target.checked)}
                />
                <label htmlFor="use-unanswered">Использовать не пройденные вопросы</label>
            </div>
        </div>
    );
}

// Рендерим компонент в DOM
ReactDOM.render(
    <QuestionsList />,
    document.getElementById('questions-container')
); 