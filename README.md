# Apache Solr E-Commerce Search Platform (Lab 13)

A full-text product search engine powered by **Apache SolrCloud** with a **Next.js** web interface featuring faceted navigation, autocomplete suggestions, highlighting, sorting, and pagination.

## Prerequisites

- **Java 11+** (OpenJDK 21 recommended)
- **Apache Solr 9.8.1** (extracted to `C:\solr-9.8.1`)
- **Node.js 18+** and npm

---

## Complete Setup & Run Instructions (Windows)

Follow these steps exactly to start the Solr cluster, index the data, and run the Next.js web application.

### 1. Start the SolrCloud Cluster

Open a Command Prompt or PowerShell and start a 2-node Solr cluster:
```powershell
C:\solr-9.8.1\bin\solr.cmd start -e cloud -noprompt
```
*Wait a minute for both nodes (ports 8983 and 7574) and the embedded ZooKeeper to fully start.*

### 2. Create the `products` Collection

```powershell
C:\solr-9.8.1\bin\solr.cmd create -c products
```

### 3. Configure the Schema

Add the specific fields required for our e-commerce dataset using `curl.exe` (this avoids PowerShell alias conflicts):

```powershell
curl.exe -X POST -H "Content-Type: application/json" "http://localhost:8983/solr/products/schema" --data-binary "{""add-field"": [{""name"":""name"",""type"":""text_general"",""stored"":true}, {""name"":""description"",""type"":""text_general"",""stored"":true}, {""name"":""category"",""type"":""string"",""stored"":true}, {""name"":""brand"",""type"":""string"",""stored"":true}, {""name"":""price"",""type"":""pfloat"",""stored"":true}, {""name"":""rating"",""type"":""pfloat"",""stored"":true}, {""name"":""in_stock"",""type"":""boolean"",""stored"":true}, {""name"":""tags"",""type"":""text_general"",""stored"":true,""multiValued"":true}, {""name"":""date_added"",""type"":""pdate"",""stored"":true}]}"
```

### 4. Index the Product Catalog Data

Import the 100-product dataset from the `solr-data` folder:

```powershell
curl.exe -X POST -H "Content-Type: text/csv" "http://localhost:8983/solr/products/update/csv?commit=true" --data-binary "@C:\Users\Mahad Jawad\Documents\GitHub\PDC-OEL\solr-data\products.csv"
```

### 5. Start the Next.js Frontend

Open a new terminal window, navigate to the `search-app` directory, and start the development server:

```powershell
cd C:\Users\Mahad Jawad\Documents\GitHub\PDC-OEL\search-app
npm install
npm run dev
```

Open **http://localhost:3000** in your web browser.

---

## Stopping the Application

When you are done, you can stop the Solr cluster to free up memory:
```powershell
C:\solr-9.8.1\bin\solr.cmd stop -all
```
And press `Ctrl+C` in the terminal running the Next.js server.

---

## Features

- **Full-text Search** with highlighted matching terms
- **Autocomplete** suggestions as you type
- **Faceted Navigation** by Category and Brand
- **Price Range** filtering
- **In-Stock** filter toggle
- **Sorting** by Relevance, Price, Rating, Date, Name
- **Pagination** with URL-based state
- **Responsive** dark mode UI with glassmorphism design

## Tech Stack

- **Backend / Search Engine**: Apache Solr 9.8.1 (SolrCloud mode, ZooKeeper)
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Vanilla CSS (CSS custom properties, dark theme, glassmorphism)
