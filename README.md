# Miku Bloch Sphere

An interactive, web-based visualizer designed to bridge quantum information theory and modern web graphics. **Miku Bloch Sphere** provides a real-time 3D simulation of single-qubit quantum states and single-qubit logic gate transformations, wrapped in a streamlined, Hatsune Miku-inspired user interface.

**Live Application:** [https://mercury308.github.io/mikublochsphere/](https://mercury308.github.io/mikublochsphere/)

---

## Key Features

* **Interactive 3D Sphere:** Orbit, pan, and zoom controls for intuitive visualization of state vectors in three-dimensional space using WebGL rendering.
* **Quantum State Parameterization:** Dynamic manipulation of polar ($\theta$) and azimuthal ($\phi$) angles to navigate pure single-qubit states across the Hilbert space.
* **Quantum Logic Gate Operations:** Real-time application and trajectory tracing of standard single-qubit transformations (Hadamard, Pauli-X, Pauli-Y, Pauli-Z, Phase S, and $\pi/8$ $T$ gates).
* **Responsive Control Panel:** Clean UI with real-time vector representation updates, probability amplitude breakdowns, and visual theme consistency.

---

## Theoretical Overview

A pure single-qubit quantum state $|\psi\rangle$ belongs to a two-dimensional complex Hilbert space $\mathbb{C}^2$. Standard normalization allows representation as a point on the surface of a unit sphere in $\mathbb{R}^3$, known as the **Bloch Sphere**:

$$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$

Where:
* **$\theta \in [0, \pi]$** denotes the polar angle, dictating the measurement probability distributions: $P(|0\rangle) = \cos^2(\theta/2)$ and $P(|1\rangle) = \sin^2(\theta/2)$.
* **$\phi \in [0, 2\pi)$** denotes the azimuthal angle, representing the relative quantum phase.

---

## Tech Stack

| Domain | Technology / Library |
| :--- | :--- |
| **Language** | ECMAScript 2022+ (JavaScript) |
| **Rendering** | Three.js / WebGL |
| **Markup & Styling** | HTML5, CSS3 (Custom Properties) |
| **Hosting & CI/CD** | GitHub Pages |

---

## Local Development & Installation

Follow these instructions to set up a local development environment.

### Prerequisites

Ensure you have a modern web browser and a lightweight local server utility (such as Node.js or Python 3) installed.

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/mercury308/mikublochsphere.git](https://github.com/mercury308/mikublochsphere.git)
   cd mikublochsphere