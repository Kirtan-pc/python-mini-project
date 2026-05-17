"""
🧠 Math Quiz Game
A fun MCQ-based math quiz with lives, streak and varied question types!
"""

import random
import time


def is_prime(n):
    """Check if a number is prime."""
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True


def generate_question(difficulty):
    """
    Generate a random math question based on difficulty level.
    difficulty 1 = easy, 2 = medium, 3 = hard
    Returns: question string, correct answer
    """

    # Pick question type based on difficulty
    if difficulty == 1:
        q_type = random.choice(['add', 'sub', 'mul', 'div'])
    elif difficulty == 2:
        q_type = random.choice(['add', 'sub', 'mul', 'div',
                                'negative', 'decimal',
                                'percentage', 'missing'])
    else:
        q_type = random.choice(['bodmas', 'prime', 'conversion',
                                'percentage', 'decimal'])

    # ── Easy questions ──────────────────────────────

    if q_type == 'add':
        a, b = random.randint(1, 60), random.randint(1, 60)
        return f"What is {a} + {b}?", a + b

    elif q_type == 'sub':
        a, b = random.randint(1, 50), random.randint(1, 50)
        if a < b:
            a, b = b, a
        return f"What is {a} - {b}?", a - b

    elif q_type == 'mul':
        a, b = random.randint(2, 15), random.randint(2, 15)
        return f"What is {a} × {b}?", a * b

    elif q_type == 'div':
        b = random.randint(2, 10)
        a = b * random.randint(2, 10)
        return f"What is {a} ÷ {b}?", a // b

    # ── Medium questions ─────────────────────────────

    elif q_type == 'negative':
        a = random.randint(-25, -1)
        b = random.randint(1, 30)
        return f"What is {a} + {b}?", a + b

    elif q_type == 'decimal':
        a = round(random.uniform(1.0, 10.0), 1)
        b = round(random.uniform(1.0, 10.0), 1)
        return f"What is {a} + {b}?", round(a + b, 1)

    elif q_type == 'percentage':
        percent = random.choice([10, 20, 25, 50])
        number = random.choice([100, 200, 300, 400, 500])
        correct = int((percent / 100) * number)
        return f"What is {percent}% of {number}?", correct

    elif q_type == 'missing':
        a = random.randint(1, 50)
        b = random.randint(1, 50)
        total = a + b
        return f"__ + {b} = {total}, find __?", a

    # ── Hard questions ───────────────────────────────

    elif q_type == 'bodmas':
        a = random.randint(1, 20)
        b = random.randint(1, 20)
        c = random.randint(1, 5)
        correct = a + b * c      # multiplication first
        return f"What is {a} + {b} × {c}?", correct

    elif q_type == 'prime':
        # pick a number, ask if prime
        num = random.randint(10, 50)
        correct = 1 if is_prime(num) else 2
        return f"Is {num} a prime number? (1=Yes / 2=No)", correct

    elif q_type == 'conversion':
        conv = random.choice(['hours', 'minutes', 'days'])
        if conv == 'hours':
            h = random.randint(1, 10)
            return f"{h} hour(s) = ? minutes", h * 60
        elif conv == 'minutes':
            m = random.randint(1, 10)
            return f"{m} minute(s) = ? seconds", m * 60
        else:
            d = random.randint(1, 7)
            return f"{d} day(s) = ? hours", d * 24

    # fallback
    a, b = random.randint(1, 30), random.randint(1, 30)
    return f"What is {a} + {b}?", a + b


def generate_options(correct):
    """
    Generate 4 MCQ options with one correct answer.
    Wrong options are close to correct to make it tricky.
    """
    options = set()
    options.add(correct)

    attempts = 0
    while len(options) < 4 and attempts < 50:
        offset = random.randint(-15, 15)
        fake = correct + offset
        if fake != correct:
            options.add(fake)
        attempts += 1

    # fallback if not enough options
    extra = correct + 1
    while len(options) < 4:
        if extra not in options:
            options.add(extra)
        extra += 1

    options = list(options)
    random.shuffle(options)
    return options


def get_grade(score, total):
    """Return grade based on score percentage."""
    if total == 0:
        return "N/A"
    percentage = (score / total) * 100
    if percentage >= 90:
        return "A+ 🌟"
    elif percentage >= 80:
        return "A 😄"
    elif percentage >= 70:
        return "B+ 👍"
    elif percentage >= 60:
        return "B 🙂"
    elif percentage >= 50:
        return "C 😐"
    else:
        return "F 😢"


def display_status(lives, streak, score, difficulty):
    """Display current lives, streak, score and difficulty."""
    hearts = "❤️ " * lives + "🖤 " * (3 - lives)
    diff_label = {1: "🟢 Easy", 2: "🟡 Medium", 3: "🔴 Hard"}
    print(f"\n{hearts}")
    print(f"🔥 Streak: {streak}  |  ⭐ Score: {score}  |  {diff_label[difficulty]}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━")


def play_game():
    """Main game loop."""

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("       🧠 MATH QUIZ        ")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("❤️  3 Lives  |  🔥 Streak System")
    print("⭐ Bonus points at streak 3, 6, 9!")
    print("🟢 Easy → 🟡 Medium → 🔴 Hard")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    input("\n🎮 Press ENTER to start...\n")

    # Game variables
    lives = 3
    score = 0
    streak = 0
    best_streak = 0
    question_count = 0
    total_possible = 0

    # Difficulty is now PERSISTENT — only goes up, never resets!
    difficulty = 1

    while lives > 0:

        question_count += 1

        # Update difficulty based on streak — NEVER goes back down
        if streak >= 6 and difficulty < 3:
            difficulty = 3
        elif streak >= 3 and difficulty < 2:
            difficulty = 2

        # Generate question and options
        question, correct = generate_question(difficulty)
        options = generate_options(correct)
        correct_index = options.index(correct) + 1

        # Display status
        display_status(lives, streak, score, difficulty)

        # Display question
        print(f"\n❓ Q{question_count}: {question}\n")
        for i, opt in enumerate(options, 1):
            print(f"   {i}) {opt}")

        # Track time
        start = time.time()

        # Get user input safely
        while True:
            try:
                answer = int(input("\n👉 Your choice (1-4): "))
                if 1 <= answer <= 4:
                    break
                else:
                    print("⚠️  Please enter 1, 2, 3 or 4!")
            except ValueError:
                print("⚠️  Invalid input! Enter 1, 2, 3 or 4")

        elapsed = round(time.time() - start, 1)
        total_possible += 10

        # Check answer
        if answer == correct_index:
            streak += 1
            best_streak = max(best_streak, streak)
            score += 10
            print(f"\n✅ Correct! +10 points  ⏱️ {elapsed}s")
            print(f"🔥 Streak: {streak}")

            # Bonus at streak 3, 6, 9
            if streak in [3, 6, 9]:
                score += 5
                total_possible += 5
                print(f"🎉 STREAK BONUS! +5 points!")

        else:
            lives -= 1
            streak = 0
            print(f"\n❌ Wrong! Correct answer was: {correct}")
            if lives > 0:
                print(f"💔 Lives remaining: {'❤️ ' * lives}")

    # Game Over screen
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("        💀 GAME OVER!       ")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📊 Final Score   : {score}")
    print(f"❓ Questions     : {question_count}")
    print(f"🔥 Best Streak   : {best_streak}")
    print(f"⭐ Grade         : {get_grade(score, total_possible)}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━")

    again = input("\n▶️  Play Again? (Y/N): ").strip().upper()
    if again == 'Y':
        play_game()
    else:
        print("\n👋 Thanks for playing! Keep practicing! 🧠")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


if __name__ == "__main__":
    play_game()