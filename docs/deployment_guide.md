# Deployment Guide

This guide outlines the steps to deploy your Smart Color Palette Generator application to two popular platforms: Google Cloud Run and Vercel (via GitHub).

## 1. Deploying to Google Cloud Run

Google Cloud Run allows you to deploy containerized applications that automatically scale with demand.

### Prerequisites

*   A Google Cloud Project with billing enabled.
*   The `gcloud` command-line interface (CLI) installed and authenticated.
*   Docker installed on your local machine.

### Steps

#### 1.1. Create a `Dockerfile`

Create a file named `Dockerfile` in the root of your project with the following content. This `Dockerfile` will build your React application and then serve it using Nginx.

```dockerfile
# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# This layer will be cached unless package.json or package-lock.json changes
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application from the builder stage to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80, as Nginx runs on this port by default
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
```

#### 1.2. Build and Push the Docker Image

1.  **Enable Container Registry or Artifact Registry API:**
    If you haven't already, enable the Container Registry or Artifact Registry API for your Google Cloud Project.
    ```bash
    gcloud services enable containerregistry.googleapis.com
    # Or for Artifact Registry:
    # gcloud services enable artifactregistry.googleapis.com
    # gcloud auth configure-docker us-central1-docker.pkg.dev # (replace region as needed)
    ```

2.  **Build the Docker image:**
    Replace `[YOUR_PROJECT_ID]` with your actual Google Cloud Project ID and `[IMAGE_NAME]` with a name for your image (e.g., `color-palette-app`).
    ```bash
    docker build -t gcr.io/[YOUR_PROJECT_ID]/[IMAGE_NAME]:latest .
    # Or for Artifact Registry:
    # docker build -t us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/[REPOSITORY_NAME]/[IMAGE_NAME]:latest .
    ```

3.  **Push the image to Google Container Registry (GCR) or Artifact Registry:**
    ```bash
    docker push gcr.io/[YOUR_PROJECT_ID]/[IMAGE_NAME]:latest
    # Or for Artifact Registry:
    # docker push us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/[REPOSITORY_NAME]/[IMAGE_NAME]:latest
    ```

#### 1.3. Deploy to Cloud Run

1.  **Enable Cloud Run API:**
    ```bash
    gcloud services enable run.googleapis.com
    ```

2.  **Deploy your service:**
    Replace `[SERVICE_NAME]` with a desired name for your Cloud Run service (e.g., `color-palette-service`), and use the same image path as above.
    The `API_KEY` is crucial for the `@google/genai` SDK. Set it as an environment variable in Cloud Run.
    ```bash
    gcloud run deploy [SERVICE_NAME] \
      --image gcr.io/[YOUR_PROJECT_ID]/[IMAGE_NAME]:latest \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    *   `--platform managed`: Deploys to the fully managed Cloud Run environment.
    *   `--region us-central1`: Choose a Google Cloud region close to your users (e.g., `us-central1`, `europe-west1`).
    *   `--allow-unauthenticated`: Makes your service publicly accessible. If you need authentication, you can omit this flag and configure IAM roles.
    *   `--set-env-vars API_KEY=YOUR_GEMINI_API_KEY_HERE`: **Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API Key.** This is how the `process.env.API_KEY` variable in your application gets populated.

3.  **Confirm Deployment:**
    After deployment, the `gcloud` CLI will provide a URL where your application is accessible.

## 2. Deploying to Vercel (via GitHub)

Vercel provides a seamless deployment experience for frontend applications, especially when integrated with GitHub.

### Prerequisites

*   Your project code pushed to a GitHub repository.
*   A Vercel account linked to your GitHub account.

### Steps

#### 2.1. Push Your Code to GitHub

Ensure all your application code, including the `index.html`, `index.tsx`, `App.tsx`, `types.ts`, and `services/geminiService.ts` files, is committed and pushed to a GitHub repository.

#### 2.2. Import Your Project in Vercel

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click on "New Project" or "Add New..." -> "Project".
3.  Choose to "Import Git Repository" and select the GitHub repository where your project is hosted.
4.  Vercel will automatically detect that it's a Vite project (or a similar React setup) and suggest default settings.

#### 2.3. Configure Project Settings (if necessary)

Vercel usually auto-detects Vite projects correctly. However, you might need to confirm or adjust a few settings:

*   **Framework Preset:** Ensure it's set to "Vite" (or "Create React App" if you used that for initialization, though this project uses Vite).
*   **Root Directory:** If your project is in a subdirectory of your repository, specify it here. Otherwise, leave it blank.
*   **Build Command:** `npm run build` (This is the default for Vite).
*   **Output Directory:** `dist` (This is the default for Vite).

#### 2.4. Set Environment Variables

The `API_KEY` for the `@google/genai` SDK needs to be securely stored as an environment variable in Vercel.

1.  In your Vercel Project Settings, navigate to the "Environment Variables" section.
2.  Add a new environment variable:
    *   **Name:** `API_KEY`
    *   **Value:** `YOUR_GEMINI_API_KEY_HERE` (Replace with your actual Gemini API Key).
3.  Ensure it's set for all environments (Production, Preview, Development).

#### 2.5. Deploy

Once your project is configured and environment variables are set, Vercel will automatically trigger a deployment.

*   For the initial import, Vercel will deploy your main branch (e.g., `main` or `master`).
*   Subsequent pushes to your connected GitHub branch will automatically trigger new deployments.
*   Vercel will provide a unique URL for your deployed application.

#### 2.6. Custom Domains (Optional)

You can easily link a custom domain to your Vercel project through the project settings if you have one.

---

**Important Security Note:**

Always ensure your `API_KEY` is treated as a sensitive secret. **Never** hardcode it directly into your frontend code or commit it to your repository. Using environment variables, as shown above, is the recommended secure practice for deployment.
