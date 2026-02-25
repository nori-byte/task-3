Vue.component('card-item', {
    props: {
        card: { type: Object, required: true }
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
        // Синхронизация локальных полей, если карточка изменилась извне (например, при обновлении в другой колонке)
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
            <button @click="$emit('remove-card', card.id)">Удалить</button>
             <button @click="isEditing = true">Редактировать</button>
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

// Первая колонка (Запланированные задачи)
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
<!--                            <p>-->
<!--                                <label for="createdAt">Created task:</label>-->
<!--                                <input type="datetime-local" id="createdAt" v-model="createdAt">-->
<!--                            </p>-->
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
                        @remove-card="$emit('remove-card', $event)"
                         @update-card="$emit('update-card', $event)"
                    ></card-item>
                </div>
            </div>
<!--            <button @click="removeToCart">Remove to cart</button>-->
        </div>
    `,
    data() {
        return {
            name: '',
            errors: [],
            description: '',
            deadline: '',
            createdAt: '',
            lastEdited: null,
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
            this.createdAt = '';
        },
        removeToCart() {
            if (this.cards.length > 0) {
                const lastCard = this.cards[this.cards.length - 1];
                this.$emit('remove-card', lastCard.id);
            }
        },
            updateTimestamp() {
                this.lastEdited = new Date();
            }
    },
    computed: {
        formattedLastEdited() {
            if (!this.lastEdited) return '';
            return this.lastEdited.toLocaleString(); // локальный формат даты и времени
        }
    },
});

// Вторая колонка (Задачи в работе)
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

// Третья колонка (Тестирование)
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

// Четвёртая колонка (Выполненные задачи)
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

// Корневой экземпляр Vue
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
        removeCard(cardId) {
            this.firstColumnCards = this.firstColumnCards.filter(card => card.id !== cardId);
            this.secondColumnCards = this.secondColumnCards.filter(card => card.id !== cardId);
            this.thirdColumnCards = this.thirdColumnCards.filter(card => card.id !== cardId);
            this.fourthColumnCards = this.fourthColumnCards.filter(card => card.id !== cardId);
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
        }
    },

});

