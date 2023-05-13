# Use an official miniconda3 runtime as a parent image
FROM continuumio/miniconda3:latest

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Create a conda environment and activate it
RUN conda env create -f environment.yml
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]

# Expose port 8888 for JupyterLab
EXPOSE 8888

# Run JupyterLab when the container launches
CMD ["jupyter", "lab", "--ip='*'", "--port=8888", "--no-browser"]
