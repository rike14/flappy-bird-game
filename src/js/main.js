const buttonStarGame = document.querySelector('[wm-start]');
const gameOver = document.querySelector('[wm-game-over]');

function newElement(tagName, className) {
    const element = document.createElement(tagName);
    element.className = className;
    return element;
}

function Barrier(reverse = false){
    this.element = newElement('div', 'barriers');

    const borderBarriers = newElement('div', 'border-barriers');
    const bodyBarriers = newElement('div', 'body-barriers');

    this.element.appendChild(reverse ? bodyBarriers : borderBarriers);
    this.element.appendChild(reverse ? borderBarriers : bodyBarriers);

    this.setHeightBarriers = heightBarriers => bodyBarriers.style.height = `${heightBarriers}px`;
}

function PairBarriers(height, opened, x){
    this.element = newElement('div', 'pair-of-barriers');

    this.upper = new Barrier(true);
    this.bottom = new Barrier(false);

    this.element.appendChild(this.upper.element);
    this.element.appendChild(this.bottom.element);

    this.sortOpened = () => {
        const heightUpper = Math.random() * (height - opened);
        const heightBottom = height - opened - heightUpper;
        this.upper.setHeightBarriers(heightUpper);
        this.bottom.setHeightBarriers(heightBottom);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getWidth = () => this.element.clientWidth;

    this.sortOpened();
    this.setX(x);
}

function Barriers(height, width, opened, space, notificationPoint){
    this.pairs = [
        new PairBarriers(height, opened, width),
        new PairBarriers(height, opened, width + space),
        new PairBarriers(height, opened, width + space * 2),
        new PairBarriers(height, opened, width + space * 3)
    ]

    const displacement = 3;
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement);

            if(pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length);
                pair.sortOpened();
            }

            const middle = width / 2;
            const middleWare = pair.getX() + displacement >= middle && pair.getX() < middle;

            if (middleWare) {
                notificationPoint()
            };

        });
    }
}
function Bird(heightGame) {
    let fly = false;

    this.element = newElement('img', 'bird');
    this.element.src = 'src/imgs/bird.png';

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = y => this.element.style.bottom = `${y}px`;

    window.onkeydown = e => fly = true;
    window.onkeyup = e => fly = false;

    this.animate = () => {
        const newY = this.getY() + (fly ? 8 : -5);
        const heightMax = heightGame - this.element.clientHeight;

        if(newY <= 0){
            this.setY(0)
        } else if (newY >= heightMax) {
            this.setY(heightMax)
        } else {
            this.setY(newY)
        }
    }

    this.setY(heightGame / 2);

}

function Progress() {
    this.element = newElement('span', 'progress');
    this.updatePoint = points => {
        this.element.innerHTML = points;
    }
    this.updatePoint(0);
}

function c(elementA, elementB) {
    const a = elementA.getBoundingClientRect();
    const b = elementB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

    return horizontal && vertical;
}

function shock(bird, barriers) {
    let shock = false;

    barriers.pairs.forEach(pairBarriers => {
        if(!shock) {
            const upper = pairBarriers.upper.element;
            const bottom = pairBarriers.bottom.element;
            shock = c(bird.element, upper) || c(bird.element, bottom);
        }
    })
    return shock;
}

function FlappyBird() {
    let points = 0;

    const areaGame = document.querySelector('[wm-flappy]');
    const height = areaGame.clientHeight;
    const width = areaGame.clientWidth;

    const progress = new Progress();
    const barriers = new Barriers(height, width, 200, 400, () => progress.updatePoint(++points));
    const bird = new Bird (height);

    areaGame.appendChild(progress.element);
    areaGame.appendChild(bird.element);
    barriers.pairs.forEach(pair => areaGame.appendChild(pair.element));

    this.start = () => {
        const time = setInterval(() => {
            barriers.animate();
            bird.animate();

            if(shock(bird, barriers)) {
                clearInterval(time);
                gameOver.classList.remove('hidden')
                setInterval(() => {
                    location.reload();
                    buttonStarGame.classList.remove('hidden');
                    gameOver.classList.add('hidden')
                }, 3000)
            }
        }, 20)
    }
}


function startGame() {
    new FlappyBird().start();
    buttonStarGame.classList.add('hidden');
}

