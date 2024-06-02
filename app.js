const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;
const windowSize = 10;
const numbersWindow = [];

const TEST_SERVER_URL = "http://20.244.56.144/test/";

app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: "Average Calculator Microservice" });
});

async function fetchNumberFromTestServer(numberId) {
  try {
    const response = await axios.get(`${TEST_SERVER_URL}/${numberId}`, { timeout: 500 });
    return response.data.number;
  } catch (error) {
    throw new Error('Failed to fetch number from test server');
  }
}

function updateWindow(newNumber) {
  const previousWindow = [...numbersWindow];

  if (!numbersWindow.includes(newNumber)) {
    if (numbersWindow.length >= windowSize) {
      numbersWindow.shift();
    }
    numbersWindow.push(newNumber);
  }

  const currentWindow = [...numbersWindow];
  const avg = currentWindow.reduce((a, b) => a + b, 0) / currentWindow.length;

  return { previousWindow, currentWindow, avg };
}

app.post('/calculate-average/?numberId', async (req, res) => {
  const numberId = req.body.id;

  try {
    const fetchedNumber = await fetchNumberFromTestServer(numberId);
    const { previousWindow, currentWindow, avg } = updateWindow(fetchedNumber);

    res.send({
      fetched_numbers: [fetchedNumber],
      previous_window: previousWindow,
      current_window: currentWindow,
      average: avg
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Average Calculator Microservice listening at http://localhost:${port}`);
});