import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState(null);
  const [csrftoken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get CSRF token from cookies when component mounts
    const getCookie = (name) => {
    const cookieValue = `; ${document.cookie}`;
    const parts = cookieValue.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const token = getCookie('csrftoken');
    setCsrfToken(token);
  }, []);

const handleRegister = async () => {
    event.preventDefault();
    if (email.endsWith('@student.42lehavre.fr')) {
        setError('Emails from @student.42lehavre.fr are not allowed for registration.');
        return;
    }

    const checkbox = document.getElementById('terms');

    if (!checkbox.checked) {
        // event.preventDefault();
        setError('Please accept the Terms and Conditions to proceed.');
        return;
    }

    try {
        const response = await fetch('/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                username,
                email,
                password1,
                password2,
                nickname,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            navigate('/login');
        } else {
            setError(data.error || data.message || 'An error occurred during registration.');
        }
    } catch (error) {
        setError(error || 'An error occurred during registration.');
    }
}

  // Function to handle Enter key press
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleRegister();
    }
  };

  /* ------------------- Frontend ------------------- */

  const [isWrapperActive, setIsWrapperActive] = useState(true);
  const [isPopupActive, setIsPopupActive] = useState(true);
  const [isRGPD, setIsRGPD] = useState(false);

  const handleLoginClick = ()=> {
      navigate('/login');
  }

  const handleBtnPopupClick = ()=> {
      setIsPopupActive(true);
  }

  const handleIconCloseClick = ()=> {
      setIsPopupActive(false);
  }

  return (
    <div className="body">
        <header className='loginHeader'>
            <h2 className="logo">PONG</h2>
            <nav className="navigation">
                <button className="btnLogin-popup" onClick={handleBtnPopupClick}>Register</button>
            </nav>
        </header>

        <div className="overlay"></div>

        {error && <p className='error'>{error}</p>}

        <div className={`wrapper ${isPopupActive ? 'active-popup' : ''} ${isWrapperActive ? 'active' : ''}`}>
            <span className="icon-close" onClick={handleIconCloseClick}>
                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            </span>

            <div className={`form-box register ${isRGPD ? 'rgpd' : ''}`}>
                {isRGPD && <>
                    <div className="conditionexit" onClick={() => setIsRGPD(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="white"><path d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z"/></svg>
                    </div>
                    <h1>Politique de confidentialité</h1>
                    <div><br/></div>
                    <div><strong>Introduction</strong></div>
                    <div>Devant le développement des nouveaux outils de communication, 
                        il est nécessaire de porter une attention particulière à la protection de la vie privée. 
                        C’est pourquoi, nous nous engageons à respecter la confidentialité des renseignements 
                        personnels que nous collectons.</div><div><br/></div>
                    <h2>Collecte des renseignements personnels</h2>
                    <div><br/></div>
                    <div><ul><li>Adresse électronique</li></ul></div>
                    <div>Les renseignements personnels que nous collectons sont recueillis au travers de 
                        formulaires et grâce à l’interactivité établie entre vous et notre site Web. Nous utilisons également, 
                        comme indiqué dans la section suivante, des fichiers témoins et/ou journaux pour réunir des informations 
                        vous concernant.</div><div><br/></div>
                        <h2>Formulaires&nbsp;et interactivité:</h2>
                        <div>Vos renseignements personnels sont collectés par le biais de formulaire, à savoir :</div>
                        <div><br/></div>
                        <div><ul><li>Formulaire d'inscription au site Web</li></ul></div>
                        <div>Nous utilisons les renseignements ainsi collectés pour les finalités suivantes :</div>
                        <div><br/></div><div><ul><li>Informations / Offres promotionnelles</li></ul></div>
                        <div>Vos renseignements sont également collectés par le biais de l’interactivité pouvant s’établir 
                            entre vous et notre site Web et ce, de la façon suivante:</div>
                        <div><br/></div><div><ul></ul></div>
                        <div>Nous utilisons les renseignements ainsi collectés pour les finalités suivantes :</div>
                        <div><br/></div><div><ul><li>Informations ou pour des offres promotionnelles</li></ul></div>
                        <div><br/></div><h2>Droit d’opposition et de retrait</h2>
                        <div>Nous nous engageons à vous offrir un droit d’opposition et de retrait quant à vos 
                            renseignements personnels.</div>
                        <div>Le droit d’opposition s’entend comme étant la possiblité offerte aux internautes de 
                            refuser que leurs renseignements personnels soient utilisées à certaines fins mentionnées 
                            lors de la collecte.</div><div><br/></div>
                        <div>Le droit de retrait s’entend comme étant la possiblité offerte aux internautes de demander 
                            à ce que leurs renseignements personnels ne figurent plus, par exemple, dans une liste de diffusion.</div>
                        <div><br/></div><div><strong>Pour pouvoir exercer ces droits, vous pouvez :</strong></div>
                        <div><br/></div><div></div><div></div><div></div><div>Section du site web :&nbsp;&nbsp; https://localhost:8000/security</div>
                        <div><br/></div><h2>Droit d’accès</h2><div>Nous nous engageons à reconnaître un droit d’accès 
                            et de rectification aux personnes concernées désireuses de consulter, modifier, voire radier les informations les concernant.</div>
                            <div><br/></div><div><strong>L’exercice de ce droit se fera :</strong></div>
                        <div><br/></div><div></div><div></div><div></div>
                        <div>Section du site web :&nbsp;&nbsp; https://localhost:8000/security</div>
                        <div><br/></div><h2>Sécurité</h2><div>Les renseignements personnels que nous collectons sont conservés 
                            dans un environnement sécurisé. Les personnes travaillant pour nous sont tenues de respecter la confidentialité 
                            de vos informations.</div><div><br/></div>
                        <div>Pour assurer la sécurité de vos renseignements personnels, nous avons recours aux mesures suivantes :</div>
                        <div><br/></div><div><ul><li>Protocole SSL</li><li>Gestion des accès - personne autorisée</li><li>Identifiant / mot de passe</li></ul></div>
                        <div>Nous nous engageons à maintenir un haut degré de confidentialité en intégrant les dernières 
                            innovations technologiques permettant d’assurer la confidentialité de vos transactions. Toutefois, comme aucun mécanisme 
                            n’offre une sécurité maximale, une part de risque est toujours présente lorsque l’on utilise Internet pour transmettre 
                            des renseignements personnels.</div><div><br/></div><h2>Législation</h2>
                        <div>Nous nous engageons à respecter les dispositions législatives énoncées dans :</div>
                        <div><br/></div><div>Législation:  oui</div><div><br/></div><div><strong>Générateur de politique de confidentialité / </strong>
                        <a href="//www.politiquedeconfidentialite.ca" target="_blank"><strong>Politique de confidentialité</strong></a></div>
                </>}
                {!isRGPD && <>
                    <h2>Registration</h2>
                    <form action='#'>
                        <div className="input-box">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                            </span>
                            <input type="text"
                                    placeholder=' '
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    maxLength={15}
                                    required/>
                            <label>Username - max 15 characters</label>
                        </div>
                        <div className="input-box">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                            </span>
                            <input type="email"
                                    placeholder=' '
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    maxLength={30}
                                    required/>
                            <label>Email</label>
                        </div>
                        <div className="input-box">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>
                            </span>
                            <input type="password"
                                    placeholder=' '
                                    value={password1}
                                    onChange={(e) => setPassword1(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    required/>
                            <label>Password - min 8 characters</label>
                        </div>
                        <div className="input-box">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>
                            </span>
                            <input type="password"
                                    placeholder=' '
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    required/>
                            <label>Confirm password</label>
                        </div>
                        <div className="input-box">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                            </span>
                            <input type="text"
                                    placeholder=' '
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    maxLength={15}
                                    required/>
                            <label>Nickname  - max 15 characters</label>
                        </div>
                        <div className="rgpd" onClick={() => setIsRGPD(true)}>Condition of utilisation</div>
                        <div className="rgpdInput">
                            <input type='checkbox' id='terms' required />
                            Accept the Terms and Conditions of utilisation
                        </div>
                        <button type="submit" className="btn" onClick={handleRegister}>Register<i></i></button>
                        <div className="login-register">
                            <p>Already have an account ? <a
                                className="login-link" onClick={handleLoginClick}> Login</a>
                            </p>
                        </div>
                    </form>
                </>}
            </div>
        </div>
    </div>
  );
};

export default RegistrationPage;
