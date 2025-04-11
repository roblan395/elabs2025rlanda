'use client';
import React, { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { generateClient } from 'aws-amplify/api';
import { createAnuncios } from '../src/graphql/mutations';
import '../public/styles/admin.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../src/testAmplify';

Amplify.configure(awsconfig);
const client = generateClient();

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const handleAddAnnouncement = async () => {
    if (newAnnouncement.trim() !== '') {
      const content = newAnnouncement;
      const id = 16;
      const createdAt = '2024-04';
  
      const input = {
        id: id.toString(),
        content: content,
        createdAt: createdAt,
      };
  
      try {
        await client.graphql({
          query: createAnuncios,
          variables: { input }
        });
        
        toast.success("¡Anuncio creado con éxito!");
        setNewAnnouncement('');
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error al conectar con AppSync:", error);
        }
        toast.error("Error al crear el anuncio");
      }
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.warn('Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      toast.warn('Por favor ingresa un email válido');
      return;
    }

    setIsCreatingUser(true);
    
    try {
      const response = await fetch('https://l04dgc4a87.execute-api.us-east-1.amazonaws.com/create-user', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          email: newUser.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      toast.success(`Usuario creado: ${data.identity_center.username}`);
      setNewUser({
        firstName: '',
        lastName: '',
        email: ''
      });
      
    } catch (error) {
      console.error('Error detallado:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido al crear usuario');
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">📚 Panel de Administración</h1>
        <nav className="admin-nav">
          <button onClick={() => setActiveSection('inicio')} className="nav-item">🏠 Inicio</button>
          <button onClick={() => setActiveSection('anuncios')} className="nav-item">📢 Anuncios</button>
          <button onClick={() => setActiveSection('archivos')} className="nav-item">📂 Archivos</button>
          <button onClick={() => setActiveSection('usuarios')} className="nav-item">👥 Crear Usuarios</button>
          <button onClick={handleSignOut} className="admin-logout-button">🚪 Salir</button>
        </nav>
      </header>

      <main className="admin-main">
        {activeSection === 'inicio' && (
          <div>
            <h2>🏫 Bienvenido al Panel Administrativo</h2>
            <p>Desde aquí puedes gestionar anuncios, archivos y usuarios.</p>
          </div>
        )}

        {activeSection === 'anuncios' && (
          <div>
            <h2>📢 Gestionar Anuncios</h2>
            <input 
              type="text" 
              placeholder="Escribe un anuncio..." 
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              className="input-text"
            />
            <button onClick={handleAddAnnouncement} className="button-primary">Publicar</button>
          </div>
        )}

        {activeSection === 'archivos' && (
          <div>
            <h2>📂 Subir Archivos</h2>
            <input type="file" className="input-file" disabled />
            <button className="button-primary" disabled>Subir</button>
          </div>
        )}

        {activeSection === 'usuarios' && (
          <div className="user-form-container">
            <h2>👥 Crear Nuevo Usuario</h2>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={newUser.firstName}
                onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                className="input-text"
                placeholder="Ej: Roberto"
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                value={newUser.lastName}
                onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                className="input-text"
                placeholder="Ej: Ejemplo"
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="input-text"
                placeholder="Ej: test@example.com"
                required
              />
            </div>
            <button 
              onClick={handleCreateUser} 
              className="button-primary"
              disabled={isCreatingUser}
            >
              {isCreatingUser ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        )}
      </main>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AdminPage;