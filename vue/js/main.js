Vue.component('card-item', {
    props: {
        card: { type: Object, required: true },
        showMoveToWork: { type: Boolean, default: false },
        showMoveToTest: { type: Boolean, default: false },
        showMoveToEnd: { type: Boolean, default: false },
        showReturnToWork: { type: Boolean, default: false },
        isUrgent: { type: Boolean, default: false },
        blocked: { type: Boolean, default: false }
    },
    data() {
        return {
            isEditing: false,
            editedName: this.card.name,
            editedDescription: this.card.description || '',
            editedDeadline: this.card.deadline || '',
            showReturnInput: false,
            returnReasonInput: ''
        };
    },
    methods: {
        openReturnInput() {
            this.showReturnInput = true;
            this.returnReasonInput = '';
        },
        confirmReturn() {
            if (this.returnReasonInput.trim()) {
                this.$emit('return-to-work', {
                    id: this.card.id,
                    reason: this.returnReasonInput.trim()
                });
                this.showReturnInput = false;
                this.returnReasonInput = '';
            }
        },
        cancelReturn() {
            this.showReturnInput = false;
            this.returnReasonInput = '';
        },
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
 <div class="card_1">
        <div class="card" :class="{ urgent: isUrgent }">
                        <div v-if="!isEditing">
                <h3>{{ card.name }}</h3>
                <div class="card_2">
                    <p>Priority: {{ card.priority || 1 }}</p>
                    <p v-if="card.description">Description: {{ card.description }}</p>
                    <p v-if="card.deadline">Deadline: {{ new Date(card.deadline).toLocaleString() }}</p>
                    <p v-if="card.createdAt">Created: {{ new Date(card.createdAt).toLocaleString() }}</p>
                    <p v-if="card.lastEdited">Last Edited: {{ new Date(card.lastEdited).toLocaleString() }}</p>
                    <p v-if="card.returnReason" style="color: red;" :disabled="blocked">Причина возврата: {{ card.returnReason }}</p>
                    <button @click="$emit('remove-card', card.id)" :disabled="blocked">Delete</button>
                    <button @click="isEditing = true" :disabled="blocked">Edited</button>
                    <button v-if="showMoveToWork" @click="$emit('move-to-work', card.id)" :disabled="blocked">To work</button>
                    <button v-if="showMoveToTest" @click="$emit('move-to-test', card.id)"  :disabled="blocked">Testing</button>
                    <button v-if="showMoveToEnd" @click="$emit('move-to-end', card.id)" :disabled="blocked">Completed</button>
                    <button v-if="showReturnToWork && !showReturnInput" @click="openReturnInput" :disabled="blocked">Back to work</button>
                    <p v-if="card.completedStatus">Status: {{ card.completedStatus }}</p>
                    <div v-if="showReturnInput">
                        <p>
                            <label>Reason for return:</label>
                            <input v-model="returnReasonInput" placeholder="Please state the reason">
                        </p>
                        <button @click="confirmReturn">Confirm</button>
                        <button @click="cancelReturn">Cancel</button>
                    </div>
                </div>  
            </div>
            <div v-else>
                <h3>Editing</h3>
                <div clas="edit" style="padding: 10px;">
                <p>
                    <label>Name:</label>
                    <input v-model="editedName" placeholder="Name">
                </p>
                <p>
                    <label>Description:</label>
                    <textarea v-model="editedDescription" placeholder="Description"></textarea>
                </p>
                <p>
                    <label>Deadline:</label>
                    <input type="datetime-local" v-model="editedDeadline">
                </p>
                <button @click="saveChanges">Save</button>
                <button @click="cancelEditing">Cancel</button>
            </div>
        </div>
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
    computed: {
        sortedCards() {
            return this.cards.slice().sort((a, b) => (a.priority || 1) - (b.priority || 1));
        },
        urgentCardIds() {
            const now = new Date();
            return this.cards
                .filter(card => {
                    if (!card.deadline) return false;
                    const deadline = new Date(card.deadline);
                    const diff = deadline - now;
                    return !isNaN(deadline) && diff > 0 && diff < 24 * 60 * 60 * 1000;
                })
                .map(c => c.id);
        },
        hasUrgent() {
            return this.urgentCardIds.length > 0;
        }
    },
    template: `
        <div>
            <h2>Scheduled tasks</h2>
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
                                <label>Description</label>
                                <textarea v-model="description" placeholder="Введите описание" rows="3"></textarea>
                            </p>
                            <p>
                                <label for="deadline">Deadline:</label>
                                <input type="datetime-local" id="deadline" v-model="deadline">
                            </p>
                    
                            <p>
    <label>priority (1-3):</label>
    <select v-model.number="priority">
        <option value="1">1 (high)</option>
        <option value="2">2 (middle)</option>
        <option value="3">3 (low)</option>
    </select>
</p>
<p>
                                <input type="submit" value="Add card">
                            </p>
                        </div>
                    </div>
                </form>
                <div class="column-item">
                    <card-item
                        v-for="card in sortedCards"
                        :key="card.id"
                        :card="card"
                        :remove-card="true"
                        :show-move-to-work="true"
                        :is-urgent="urgentCardIds.includes(card.id)"
    :blocked="hasUrgent && !urgentCardIds.includes(card.id)"
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
            deadline: '',
            priority: 1,
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
                createdAt: new Date().toISOString(),
                priority: this.priority,
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
    computed: {
        sortedCards() {
            return this.cards.slice().sort((a, b) => (a.priority || 1) - (b.priority || 1));
        },
        urgentCardIds() {
            const now = new Date();
            return this.cards
                .filter(card => {
                    if (!card.deadline) return false;
                    const deadline = new Date(card.deadline);
                    const diff = deadline - now;
                    return !isNaN(deadline) && diff > 0 && diff < 24 * 60 * 60 * 1000;
                })
                .map(c => c.id);
        },
        hasUrgent() {
            return this.urgentCardIds.length > 0;
        }
    },
    template: `
        <div>
            <h2>Tasks at work</h2>
            <div>
                <div class="column-item">
                    <card-item
                        v-for="card in sortedCards"
                        :key="card.id"
                        :card="card"
                        :show-move-to-test="true"
                        :is-urgent="urgentCardIds.includes(card.id)"
                        :blocked="hasUrgent && !urgentCardIds.includes(card.id)"
                        @move-to-test="$emit('move-to-test', $event)"
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
    computed: {
        sortedCards() {
            return this.cards.slice().sort((a, b) => (a.priority || 1) - (b.priority || 1));
        },
        urgentCardIds() {
            const now = new Date();
            return this.cards
                .filter(card => {
                    if (!card.deadline) return false;
                    const deadline = new Date(card.deadline);
                    const diff = deadline - now;
                    return !isNaN(deadline) && diff > 0 && diff < 24 * 60 * 60 * 1000;
                })
                .map(c => c.id);
        },
        hasUrgent() {
            return this.urgentCardIds.length > 0;
        }
    },
    template: `
        <div>
            <h2>Testing</h2>
            <div>
                <div class="column-item">
                    <card-item
                        v-for="card in sortedCards"
                        :key="card.id"
                        :card="card"
                        :show-move-to-end="true"
                        :is-urgent="urgentCardIds.includes(card.id)"
                        :blocked="hasUrgent && !urgentCardIds.includes(card.id)"
                        :show-return-to-work="true" 
                        @return-to-work="$emit('return-to-work', $event)"
                        @move-to-end="$emit('move-to-end', $event)"
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
    computed: {
        sortedCards() {
            return this.cards.slice().sort((a, b) => (a.priority || 1) - (b.priority || 1));
        },
        urgentCardIds() {
            const now = new Date();
            return this.cards
                .filter(card => {
                    if (!card.deadline) return false;
                    const deadline = new Date(card.deadline);
                    const diff = deadline - now;
                    return !isNaN(deadline) && diff > 0 && diff < 24 * 60 * 60 * 1000;
                })
                .map(c => c.id);
        },
        hasUrgent() {
            return this.urgentCardIds.length > 0;
        }
    },
    template: `
        <div>
            <h2>Completed tasks</h2>
            <div>
                <div class="column-item">
                    <card-item
                        v-for="card in sortedCards"
                        :key="card.id"
                        :card="card"
                        @remove-card="$emit('remove-card', $event)"
                         @update-card="$emit('update-card', $event)"
                        :is-urgent="urgentCardIds.includes(card.id)"
                        :blocked="hasUrgent && !urgentCardIds.includes(card.id)"
                     
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
                lastEdited: null,
                priority: cardData.priority || 1,
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
            let card = this.firstColumnCards.find(card => card.id === cardId);
            if (card) {
                this.firstColumnCards = this.firstColumnCards.filter(card => card.id !== cardId);
                this.secondColumnCards.push(card);
            }
        },
        moveToTest(cardId) {
            let card = this.secondColumnCards.find(card => card.id===cardId);
            if (card) {
                this.secondColumnCards=this.secondColumnCards.filter(card=>card.id !==cardId);
                this.thirdColumnCards.push(card)
            }
        },
        moveToEnd(cardId) {
            let card = this.thirdColumnCards.find(card => card.id === cardId);
            if (card) {
                const now = new Date();
                const deadline = card.deadline ? new Date(card.deadline) : null;
                if (deadline && deadline < now) {
                    card.completedStatus = 'Overdue';
                } else {
                    card.completedStatus = 'Completed on time';
                }
                delete card.returnReason;
                this.thirdColumnCards = this.thirdColumnCards.filter(c => c.id !== cardId);
                this.fourthColumnCards.push(card);
            }
        },
        returnToWork(payload) {
            let card = this.thirdColumnCards.find(card => card.id === payload.id);
            if (card) {
                card.returnReason = payload.reason;
                this.thirdColumnCards = this.thirdColumnCards.filter(card => card.id !== payload.id);
                this.secondColumnCards.push(card);
            }
        },
    }
});