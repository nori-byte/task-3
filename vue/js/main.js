Vue.component('card-item', {
    props: {
        card: { type: Object, required: true }
    },
    template: `
        <div class="card">
            <h3>{{ card.name }}</h3>
            <p v-if="card.description">Описание: {{ card.description }}</p>
            <p v-if="card.deadline">Дедлайн: {{ card.deadline }}</p>
            <p v-if="card.createdAt">Создано: {{ new Date(card.createdAt).toLocaleString() }}</p>
            <button @click="$emit('remove-card', card.id)">Удалить</button>
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
                            <p>
                                <label for="createdAt">Created task:</label>
                                <input type="datetime-local" id="createdAt" v-model="createdAt">
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
                        @remove-card="$emit('remove-card', $event)"
                    ></card-item>
                </div>
            </div>
            <button @click="removeToCart">Remove to cart</button>
        </div>
    `,
    data() {
        return {
            name: '',
            errors: [],
            description: '',
            deadline: '',
            createdAt: ''
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
        }
    }
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
                createdAt: cardData.createdAt || new Date().toISOString()
            };
            this.firstColumnCards.push(newCard);
        },
        removeCard(cardId) {
            this.firstColumnCards = this.firstColumnCards.filter(card => card.id !== cardId);
            this.secondColumnCards = this.secondColumnCards.filter(card => card.id !== cardId);
            this.thirdColumnCards = this.thirdColumnCards.filter(card => card.id !== cardId);
            this.fourthColumnCards = this.fourthColumnCards.filter(card => card.id !== cardId);
        }
    }
});