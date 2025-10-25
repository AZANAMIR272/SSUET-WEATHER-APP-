const express = require('express');
const path = require('path');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const nodemailer = require('nodemailer'); 

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const dbConfig = {
    user: 'sa',
    password: 'azan12345678', 
    server: 'local host', 
    database: 'WeatherzDB',
    options: {
        encrypt: true, 
        trustServerCertificate: true, 
    },
};

let pool;

async function connectToDatabase() {
    try {
        pool = await new sql.ConnectionPool(dbConfig).connect();
        console.log('Connected to SQL Server and connection pool created');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1); 
    }
}

connectToDatabase();

app.get('/api/weather', async (req, res) => {
    const { city, fromDate, toDate } = req.query; 

    let query = 'SELECT * FROM WeatherRecords';
    let conditions = [];
    let request = pool.request();

    if (city) {
        conditions.push('city = @city');
        request.input('city', sql.NVarChar, city);
    }
    if (fromDate) {
        conditions.push('recorded_at >= @fromDate');
        request.input('fromDate', sql.DateTime, new Date(fromDate));
    }
    if (toDate) {
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        conditions.push('recorded_at < @toDate'); 
        request.input('toDate', sql.DateTime, endDate);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY recorded_at DESC'; 

    try {
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching weather records:', err.message);
        res.status(500).send('Failed to fetch weather records');
    }
});

app.get('/api/weather/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM WeatherRecords WHERE id = @id');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Record not found');
        }
    } catch (err) {
        console.error('Error fetching single weather record:', err.message);
        res.status(500).send('Failed to fetch weather record');
    }
});

app.post('/api/weather', async (req, res) => {
    let { city, country, temp, humidity, recorded_at } = req.body;

    if (!country || country.trim() === '') {
        country = 'Pakistan';
    }

    if (!city || temp === undefined || recorded_at === undefined) {
        return res.status(400).send('Missing required fields: city, temperature, recorded_at');
    }

    try {
        const request = pool.request();
        request
            .input('city', sql.NVarChar, city)
            .input('country', sql.NVarChar, country)
            .input('temp', sql.Float, temp)
            .input('humidity', sql.Int, humidity || null) 
            .input('temp_min', sql.Float, null)
            .input('temp_max', sql.Float, null)
            .input('feels_like', sql.Float, null)
            .input('pressure', sql.Int, null)
            .input('wind_speed', sql.Float, null)
            .input('weather_main', sql.NVarChar, null)
            .input('weather_description', sql.NVarChar, null)
            .input('recorded_at', sql.DateTime, recorded_at);

        const query = `
            INSERT INTO WeatherRecords (city, country, temp, temp_min, temp_max, feels_like,
              humidity, pressure, wind_speed, weather_main, weather_description, recorded_at)
            VALUES (@city, @country, @temp, @temp_min, @temp_max, @feels_like,
              @humidity, @pressure, @wind_speed, @weather_main, @weather_description, @recorded_at);
        `;
        await request.query(query);
        res.status(201).send('Weather record added successfully');
    } catch (err) {
        console.error('Error adding weather record:', err.message);
        res.status(500).send('Failed to add weather record');
    }
});

app.put('/api/weather/:id', async (req, res) => {
    const { id } = req.params;
    let { city, country, temp, humidity, recorded_at } = req.body;

    if (!country || country.trim() === '') {
        country = 'Pakistan';
    }

    if (!city || temp === undefined || recorded_at === undefined) {
        return res.status(400).send('Missing required fields: city, temperature, recorded_at');
    }

    try {
        const request = pool.request();
        request
            .input('id', sql.Int, id)
            .input('city', sql.NVarChar, city)
            .input('country', sql.NVarChar, country)
            .input('temp', sql.Float, temp)
            .input('humidity', sql.Int, humidity || null) 
            .input('recorded_at', sql.DateTime, recorded_at);

        const query = `
            UPDATE WeatherRecords SET
                city = @city,
                country = @country,
                temp = @temp,
                humidity = @humidity,
                recorded_at = @recorded_at
            WHERE id = @id;
        `;
        const result = await request.query(query);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Record not found for update');
        }
        res.send('Weather record updated successfully');
    } catch (err) {
        console.error('Error updating weather record:', err.message);
        res.status(500).send('Failed to update weather record');
    }
});

app.delete('/api/weather/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM WeatherRecords WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Record not found for deletion');
        }
        res.send('Weather record deleted successfully');
    } catch (err) {
        console.error('Error deleting weather record:', err.message);
        res.status(500).send('Failed to delete weather record');
    }
});

app.get('/api/weather/city-summary/:city', async (req, res) => {
    const { city } = req.params;
    try {
        const result = await pool.request()
            .input('city', sql.NVarChar, city)
            .query(`
                SELECT
                    AVG(temp) AS avg_temp,
                    MAX(temp) AS max_temp,
                    MIN(temp) AS min_temp,
                    AVG(humidity) AS avg_humidity,
                    MAX(humidity) AS max_humidity,
                    MIN(humidity) AS min_humidity
                FROM WeatherRecords
                WHERE city = @city;
            `);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.json({
                avg_temp: null, max_temp: null, min_temp: null,
                avg_humidity: null, max_humidity: null, min_humidity: null
            });
        }
    } catch (err) {
        console.error('Error fetching city weather summary:', err.message);
        res.status(500).send('Failed to fetch city weather summary');
    }
});

app.delete('/api/weather/all', async (req, res) => {
    try {
        await pool.request().query('DELETE FROM WeatherRecords');
        res.send({ message: 'All weather records deleted successfully!' });
    } catch (err) {
        console.error('Error deleting all weather records:', err.message);
        res.status(500).send({ message: 'Failed to delete all weather records.' });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password) 
            .query('SELECT id, username FROM Admins WHERE username = @username AND password = @password'); 

        if (result.recordset.length > 0) {
            const admin = result.recordset[0];
            res.status(200).json({ message: 'Login successful!', admin: { id: admin.id, username: admin.username } });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error('Error during admin login:', err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

app.post('/api/admin/add', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        let checkUsername = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Admins WHERE username = @username');
        if (checkUsername.recordset.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        if (email) {
            let checkEmail = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT id FROM Admins WHERE email = @email');
            if (checkEmail.recordset.length > 0) {
                return res.status(409).json({ message: 'Email already registered.' });
            }
        }
        
        const request = pool.request();
        request
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password) 
            .input('email', sql.NVarChar, email || null); 

        const query = `
            INSERT INTO Admins (username, password, email)
            VALUES (@username, @password, @email);
        `;
        await request.query(query);
        res.status(201).json({ message: 'Admin user added successfully!' });
    } catch (err) {
        console.error('Error adding admin user:', err.message);
        res.status(500).json({ message: 'Failed to add admin user.' });
    }
});

app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email address is required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        const checkEmail = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM NewsletterSubscriptions WHERE email = @email');
        
        if (checkEmail.recordset.length > 0) {
            return res.status(409).json({ message: 'This email is already subscribed!' });
        }

        const request = pool.request();
        request.input('email', sql.NVarChar, email);

        const query = `
            INSERT INTO NewsletterSubscriptions (email)
            VALUES (@email);
        `;
        await request.query(query);

        let transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: 'ssuettruesky@gmail.com', 
                pass: 'cjgyhqxdebhfkaeu' 
            }
        });

        let mailOptions = {
            from: 'ssuettruesky@gmail.com', 
            to: email, 
            subject: 'Welcome to TrueSky Newsletter!', 
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Welcome to the SSUET TrueSky Newsletter!</h2>
                    <p>Thank you for subscribing to our weather updates and insights. We're excited to have you!</p>
                    <p>Stay tuned for the latest weather news, climate analysis, and important alerts from TrueSky.</p>
                    <p>Best regards,<br>The SSUET TrueSky Team</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json({ message: 'Successfully subscribed to newsletter! Confirmation email sent.' });

    } catch (err) {
        console.error('Error subscribing to newsletter:', err.message);
        res.status(500).json({ message: 'Failed to subscribe to newsletter.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser.`);
});
