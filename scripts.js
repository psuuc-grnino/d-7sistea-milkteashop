// Global variable to store ordered items
var orderedItems = {};

// Load orders when the page loads
window.onload = function() {
    loadOrders();
};

// Function to load orders from localStorage
function loadOrders() {
    var existingOrders = localStorage.getItem('orderDetails');
    if (existingOrders) {
        existingOrders = JSON.parse(existingOrders);
        orderedItems = existingOrders.items;  // Restore items from storage
        displayOrders(existingOrders.output); // Display orders on page
    }
}

// Function to display orders in HTML
function displayOrders(output) {
    var orderedQuantities = document.getElementById('orderDetails');
    if (orderedQuantities) {
        orderedQuantities.innerHTML = output;
    }
}

// Function to handle order placement
function order(productType, size, price) {
    Swal.fire({
        title: 'Enter quantity for ' + size + ' ' + productType,
        input: 'number',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: (quantity) => {
            return quantity; // Here you can also handle invalid inputs
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed && result.value > 0) {
            var quantity = parseInt(result.value);
            if (!isNaN(quantity) && quantity > 0) {
                if (!orderedItems[productType]) {
                    orderedItems[productType] = {};
                }
                if (!orderedItems[productType][size]) {
                    orderedItems[productType][size] = 0;
                }
                orderedItems[productType][size] += quantity;
                updateOrderedQuantities();
            } else {
                Swal.fire('Error', 'Please enter a valid quantity.', 'error');
            }
        }
    });
}

// Function to update the display of ordered quantities
function updateOrderedQuantities() {
    var output = "<h2>Ordered Items</h2>";
    var totalCost = 0;

    for (var product in orderedItems) {
        output += "<p>" + product + ": ";
        for (var size in orderedItems[product]) {
            var itemQuantity = orderedItems[product][size];
            var itemCost = itemQuantity * getItemPrice(product, size);
            output += size + ": " + itemQuantity + " (PHP " + itemCost + ") ";
            output += `<button onclick="decreaseQuantity('${product}', '${size}')">-</button> `;
            totalCost += itemCost;
        }
        output += "<br>";
    }

    output += "<h3>Total Cost: PHP " + totalCost + "</h3>";

    // Store the updated orders and their display format in localStorage
    localStorage.setItem('orderDetails', JSON.stringify({items: orderedItems, output: output, totalCost: totalCost}));

    Swal.fire({
        title: 'Success!',
        text: 'Order added to your order summary!',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'View Order',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = 'order.html';
        }
    });
}

// Function to retrieve item prices based on product and size
function getItemPrice(productType, size) {
    var prices = {
        'Thai': {'Small': 99, 'Medium': 120, 'Large': 150},
        'Black': {'Small': 99, 'Medium': 120, 'Large': 150},
        'Almond': {'Small': 99, 'Medium': 120, 'Large': 150},
        'Matcha': {'Small': 99, 'Medium': 120, 'Large': 150},
        'Taro': {'Small': 99, 'Medium': 120, 'Large': 150},
        'Honeydew': {'Small': 99, 'Medium': 120, 'Large': 150}
    };

    return prices[productType][size];
}

// Function to decrease the quantity of a specific item
function decreaseQuantity(productType, size) {
    if (orderedItems.hasOwnProperty(productType) && orderedItems[productType].hasOwnProperty(size)) {
        if (orderedItems[productType][size] > 0) {
            orderedItems[productType][size]--;
            if (orderedItems[productType][size] === 0) {
                delete orderedItems[productType][size];
                if (Object.keys(orderedItems[productType]).length === 0) {
                    delete orderedItems[productType];
                }
            }
            updateOrderedQuantities();
        }
    }
}

// Function to handle order cancellation
function cancelOrder() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('orderDetails');
            orderedItems = {}; // Clear the global orderItems
            displayOrders("<p>No orders found.</p>");
            Swal.fire(
                'Cancelled!',
                'Your order has been cancelled.',
                'success'
            );
        }
    });
}

// Function to handle checkout
function checkout() {
    Swal.fire({
        title: 'Are you sure you want to place the order?',
        text: "You will not be able to modify the order after this step!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Place Order',
        cancelButtonText: 'Review Order'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Success!',
                'Your order has been placed successfully.',
                'success'
            ).then(() => {
                localStorage.removeItem('orderDetails');
                window.location.href = 'index.html';
            });
        }
    });
}
