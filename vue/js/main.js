
Vue.component('card-item', {
    props: {
        card: { type: Object, required: true },
        showMoveToWork: { type: Boolean, default: false } // только для первой колонки
    },
    data() {
        return {
            isEditing: false,
            editedName: this.card.name,
            editedDescription: this.card.description || '',
            editedDeadline: this.card.deadline || ''
        };
    },
    methods: {
        saveChanges() {
            this.$emit('update-card', {
                id: this.card.id,
                name: this.editedName.trim(),
                description: this.editedDescription.trim(),
                deadline: this.editedDeadline
            });
            this.isEditing = false;
        },
        cancelEditing() {
            this.editedName = this.card.name;
            this.editedDescription = this.card.description || '';
            this.editedDeadline = this.card.deadline || '';
            this.isEditing = false;
        }
    },
    watch: {
        card: {
            handler(newCard) {
                this.editedName = newCard.name;
                this.editedDescription = newCard.description || '';
                this.editedDeadline = newCard.deadline || '';
            },
            deep: true
        }
    },
    template: `
        <div class="card">
            <div v-if="!isEditing">
                <h3>{{ card.name }}</h3>
                <p v-if="card.description">Описание: {{ card.description }}</p>
                <p v-if="card.deadline">Дедлайн: {{ new Date(card.deadline).toLocaleString() }}</p>
                <p v-if="card.createdAt">Создано: {{ new Date(card.createdAt).toLocaleString() }}</p>
                <p v-if="card.lastEdited">Отредактировано: {{ new Date(card.lastEdited).toLocaleString() }}</p>
                <button @click="$emit('remove-card', card.id)">Удалить</button>
                <button @click="isEditing = true">Редактировать</button>
                <button v-if="showMoveToWork" @click="$emit('move-to-work', card.id)">В работу</button>
            </div>
            <div v-else>
                <h3>Редактирование</h3>
                <p>
                    <label>Название:</label>
                    <input v-model="editedName" placeholder="Название">
                </p>
                <p>
                    <label>Описание:</label>
                    <textarea v-model="editedDescription" placeholder="Описание"></textarea>
                </p>
                <p>
                    <label>Дедлайн:</label>
                    <input type="datetime-local" v-model="editedDeadline">
                </p>
                <button @click="saveChanges">Сохранить</button>
                <button @click="cancelEditing">Отмена</button>
            </div>
        </div>
    `
});

Vue.component('first-column', {
    props: {
        cards: Array,
        max: Number,
        formDisabled: { type: Boolean, default: false }
    },
    template: `
        <div>
            <h2>Запланированные задачи</h2>
            <div>
                <form @submit.prevent="onSubmit">
                    <p v-if="errors.length">
                        <b>Please correct the following error:</b>
                        <ul>
                            <li v-for="error in errors">{{ error }}</li>
                        </ul>
                    </p>
                    <div class="notes">
                        <div class="note">
                            <p>
                                <label for="name">Card name:</label>
                                <input id="name" v-model="name" placeholder="Enter card name">
                            </p>
                            <p>
                                <label>Описание</label>
                                <textarea v-model="description" placeholder="Введите описание" rows="3"></textarea>
                            </p>
                            <p>
                                <label for="deadline">Deadline:</label>
                                <input type="datetime-local" id="deadline" v-model="deadline">
                            </p>
                            <p>
                                <input type="submit" value="Add card">
                            </p>
                        </div>
                    </div>
                </form>
                <p v-if="!cards.length">There are no cards yet.</p>
                <div class="column-item">
                    <card-item
                        v-for="card in cards"
                        :key="card.id"
                        :card="card"
                        :show-move-to-work="true"
                        @remove-card="$emit('remove-card', $event)"
                        @update-card="$emit('update-card', $event)"
                        @move-to-work="$emit('move-to-work', $event)"
                    ></card-item>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            name: '',
            errors: [],
            description: '',
            deadline: ''
        };
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (!this.name.trim()) {
                this.errors.push("Card name is required.");
            }
            if (this.errors.length) return;

            this.$emit('add-card', {
                name: this.name.trim(),
                description: this.description.trim(),
                deadline: this.deadline,
                createdAt: new Date().toISOString()
            });
            this.name = '';
            this.description = '';
            this.deadline = '';
        }
    }
});

Vue.component('second-column', {
    props: {
        cards: Array,
        max: Number
    },
    template: `
        <div>
            <h2>Задачи в работе</h2>
            <div>
                <p v-if="!cards.length">There are no cards yet.</p>
                <div class="column-item">
                    <card-item
                        v-for="card in cards"
                        :key="card.id"
                        :card="card"
                        @remove-card="$emit('remove-card', $event)"
                        @update-card="$emit('update-card', $event)"
                    ></card-item>
                </div>
            </div>
        </div>
    `
});

Vue.component('third-column', {
    props: {
        cards: Array,
        max: Number
    },
    template: `
        <div>
            <h2>Тестирование</h2>
            <div>
                <p v-if="!cards.length">There are no cards yet.</p>
                <div class="column-item">
                    <card-item
                        v-for="card in cards"
                        :key="card.id"
                        :card="card"
                        @remove-card="$emit('remove-card', $event)"
                        @update-card="$emit('update-card', $event)"
                    ></card-item>
                </div>
            </div>
        </div>
    `
});

Vue.component('fourth-column', {
    props: {
        cards: Array
    },
    template: `
        <div>
            <h2>Выполненные задачи</h2>
            <div>
                <p v-if="!cards.length">There are no cards yet.</p>
                <div class="column-item">
                    <card-item
                        v-for="card in cards"
                        :key="card.id"
                        :card="card"
                        @remove-card="$emit('remove-card', $event)"
                        @update-card="$emit('update-card', $event)"
                    ></card-item>
                </div>
            </div>
        </div>
    `
});

new Vue({
    el: '#app',
    data: {
        firstColumnCards: [],
        secondColumnCards: [],
        thirdColumnCards: [],
        fourthColumnCards: [],
        nextCardId: 1
    },
    methods: {
        addCard(cardData) {
            const newCard = {
                id: this.nextCardId++,
                name: cardData.name,
                description: cardData.description || '',
                deadline: cardData.deadline || '',
                createdAt: cardData.createdAt || new Date().toISOString(),
                lastEdited: null
            };
            this.firstColumnCards.push(newCard);
        },
        updateCard(updatedData) {
            const allColumns = [
                this.firstColumnCards,
                this.secondColumnCards,
                this.thirdColumnCards,
                this.fourthColumnCards
            ];
            for (let column of allColumns) {
                const card = column.find(c => c.id === updatedData.id);
                if (card) {
                    card.name = updatedData.name;
                    card.description = updatedData.description;
                    card.deadline = updatedData.deadline;
                    card.lastEdited = new Date().toISOString();
                    break;
                }
            }
        },
        removeCard(cardId) {
            this.firstColumnCards = this.firstColumnCards.filter(card => card.id !== cardId);
            this.secondColumnCards = this.secondColumnCards.filter(card => card.id !== cardId);
            this.thirdColumnCards = this.thirdColumnCards.filter(card => card.id !== cardId);
            this.fourthColumnCards = this.fourthColumnCards.filter(card => card.id !== cardId);
        },
        moveToWork(cardId) {
            const card = this.firstColumnCards.find(c => c.id === cardId);
            if (card) {
                this.firstColumnCards = this.firstColumnCards.filter(c => c.id !== cardId);
                this.secondColumnCards.push(card);
            }
        }
    }
});