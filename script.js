const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');

searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
        const apiUrl = `https://graphql.bitquery.io`;
        const queryBody = JSON.stringify({
            query: `
                query($query: String!) {
                    bitcoin(network: bitcoin) {
                        transactions(
                            hash: {is: $query}
                            OR: [{outputs: {address: {is: $query}}}]
                        ) {
                            hash
                            block {
                                height
                                timestamp {
                                    iso8601
                                }
                            }
                            inputs {
                                address {
                                    address
                                }
                                value
                            }
                            outputs {
                                address {
                                    address
                                }
                                value
                            }
                        }
                    }
                }
            `,
            variables: {
                query,
            },
        });
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': 'BQY3sawxqIe2Qw968dv0EKxXJ7QsjzO9',
            },
            body: queryBody,
        });
        const data = await response.json();
        displayResults(data.data.bitcoin.transactions);
    }
});

function displayResults(transactions) {
    if (transactions.length > 0) {
        const table = document.createElement('table');
        const headers = ['Transaction Hash', 'Block Height', 'Timestamp', 'Inputs', 'Outputs'];
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach((header) => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        tableHeader.appendChild(headerRow);
        table.appendChild(tableHeader);

        const tableBody = document.createElement('tbody');
        transactions.forEach((transaction) => {
            const row = document.createElement('tr');
            const hashCell = document.createElement('td');
            hashCell.textContent = transaction.hash;
            row.appendChild(hashCell);
            const heightCell = document.createElement('td');
            heightCell.textContent = transaction.block ? transaction.block.height : '-';
            row.appendChild(heightCell);

            const timestampCell = document.createElement('td');
            timestampCell.textContent = transaction.block ? transaction.block.timestamp.iso8601 : '-';
            row.appendChild(timestampCell);

            const inputsCell = document.createElement('td');
            transaction.inputs.forEach((input) => {
                const inputDiv = document.createElement('div');
                inputDiv.textContent = `${input.address.address} (${input.value} sat)`;
                inputsCell.appendChild(inputDiv);
            });
            row.appendChild(inputsCell);

            const outputsCell = document.createElement('td');
            transaction.outputs.forEach((output) => {
                const outputDiv = document.createElement('div');
                outputDiv.textContent = `${output.address.address} (${output.value} sat)`;
                outputsCell.appendChild(outputDiv);
            });
            row.appendChild(outputsCell);

            tableBody.appendChild(row);
        });
        table.appendChild(tableBody);

        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(table);
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.innerHTML = 'No transactions found.';
        resultsDiv.style.display = 'block';
    }
}
