from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session
import pyodbc

app = Flask(__name__)
app.secret_key = 'your_secret_key'

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def ernar():
    return render_template('ernar.html')

@app.route('/admin')
@login_required
def admin():
    return render_template('admin.html')

@app.route('/nike')
@login_required
def nike():
    products = get_nike_products()
    return render_template('nike.html', products=products)

@app.route('/puma')
@login_required
def puma():
    products = get_products()
    return render_template('puma.html', products=products)

@app.route('/adidas')
@login_required
def adidas():
    products = get_products()
    return render_template('adidas.html', products=products)

def get_products():
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, price, image FROM products WHERE name LIKE 'adidas%'")
        products = cursor.fetchall()
    return products

def get_nike_products():
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, price, image FROM products WHERE name LIKE 'nike%'")
        products = cursor.fetchall()
    return products

@app.route('/add_to_cart', methods=['POST'])
@login_required
def add_to_cart():
    user_id = session['user_id']
    product_id = request.form['product_id']
    product_name = request.form['product_name']
    product_price = request.form['product_price']
    product_image = request.form['product_image']
    print(f"Adding to cart: user_id={user_id}, product_id={product_id}, product_name={product_name}, product_price={product_price}, product_image={product_image}")
    add_product_to_cart(user_id, product_id, product_name, product_price, product_image)
    return redirect(url_for('korzina'))

def add_product_to_cart(user_id, product_id, product_name, product_price, product_image):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO user_cart (user_id, product_id, product_name, product_price, product_image) VALUES (?, ?, ?, ?, ?)",
                       (user_id, product_id, product_name, product_price, product_image))
        conn.commit()

@app.route('/korzina')
@login_required
def korzina():
    user_id = session['user_id']
    cart_items = get_cart_items(user_id)
    return render_template('korzina.html', cart_items=cart_items)

def get_cart_items(user_id):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT product_id, product_name, product_price, product_image FROM user_cart WHERE user_id = ?", (user_id,))
        cart_items = cursor.fetchall()
    return cart_items

@app.route('/clear_cart', methods=['POST'])
@login_required
def clear_cart():
    user_id = session['user_id']
    clear_user_cart(user_id)
    return '', 204

def clear_user_cart(user_id):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_cart WHERE user_id = ?", (user_id,))
        conn.commit()

@app.route('/remove_from_cart', methods=['POST'])
@login_required
def remove_from_cart():
    if request.is_json:
        data = request.get_json()
        user_id = session['user_id']
        product_id = data['product_id']
        remove_product_from_cart(user_id, product_id)
        return '', 204
    else:
        return 'Unsupported Media Type', 415

def remove_product_from_cart(user_id, product_id):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_cart WHERE user_id = ? AND product_id = ?", (user_id, product_id))
        conn.commit()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user_id, role = check_user(username, password)
        if user_id:
            session['logged_in'] = True
            session['user_id'] = user_id
            session['role'] = role
            if role:
                return redirect(url_for('a_admin'))
            else:
                return redirect(url_for('admin'))
        else:
            return "Неверный логин или пароль", 401
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('user_id', None)
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        add_user(username, password)
        return redirect(url_for('login'))
    return render_template('register.html')

def add_user(username, password):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO information (username, password) VALUES (?, ?)", (username, password))
        conn.commit()

# Настройки подключения к Microsoft Access
DB_PATH = r"C:\Users\lenovo\Desktop\test\test\database.mdb"
conn_str = (
    r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
    f"DBQ={DB_PATH};"
)

try:
    with pyodbc.connect(conn_str) as conn:
        print("Успешное подключение к базе данных!")
except pyodbc.Error as e:
    print(f"Ошибка подключения: {e}")

def check_user(username, password):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, password, role FROM information WHERE username = ?", (username,))
        row = cursor.fetchone()
        if row and row[1] == password:
            return row[0], row[2]  # Возвращаем id и роль пользователя
    return None, None

@app.route('/cart_count')
@login_required
def cart_count():
    user_id = session['user_id']
    count = get_cart_count(user_id)
    return {'count': count}

def get_cart_count(user_id):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM user_cart WHERE user_id = ?", (user_id,))
        count = cursor.fetchone()[0]
    return count

@app.route('/get_all_products')
@login_required
def get_all_products():
    products = get_all_products_from_db()
    return {'products': [dict(id=row[0], name=row[1], price=row[2], image=row[3]) for row in products]}

def get_all_products_from_db():
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, price, image FROM products")
        products = cursor.fetchall()
    return products

@app.route('/a_admin')
@login_required
def a_admin():
    if session.get('role'):  # Проверяем, что роль администратора
        users = get_all_users()
        return render_template('a_admin.html', users=users)
    else:
        return redirect(url_for('admin'))

def get_all_users():
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, role FROM information")
        users = cursor.fetchall()
    return users

@app.route('/delete_user', methods=['POST'])
@login_required
def delete_user():
    if session.get('role'):  # Проверяем, что роль администратора
        user_id = request.form['user_id']
        delete_user_by_id(user_id)
        return redirect(url_for('a_admin'))
    else:
        return redirect(url_for('admin'))

def delete_user_by_id(user_id):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM information WHERE id = ?", (user_id,))
        conn.commit()

@app.route('/toggle_role', methods=['POST'])
@login_required
def toggle_role():
    if session.get('role'):  # Проверяем, что роль администратора
        user_id = request.form['user_id']
        toggle_user_role(user_id)
        return redirect(url_for('a_admin'))
    else:
        return redirect(url_for('admin'))

def toggle_user_role(user_id):
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM information WHERE id = ?", (user_id,))
        current_role = cursor.fetchone()[0]
        new_role = not current_role
        cursor.execute("UPDATE information SET role = ? WHERE id = ?", (new_role, user_id))
        conn.commit()

if __name__ == '__main__':
    app.run(debug=True)