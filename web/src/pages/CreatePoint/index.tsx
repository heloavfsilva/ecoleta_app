import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';
import './styles.css'
import logo from '../../assets/logo.svg';

interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFRes{
    sigla: string;
}

interface IBGECityRes{
    nome: string;
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedItems, setSelectItems] = useState<number[]>([]);

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');

    const [selectedPosition, setSelectPosition] = useState<[number,number]>([0,0]);
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);

    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp:''
    });

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(function(position){
                const { latitude, longitude } = position.coords;
                setInitialPosition([latitude, longitude]);
                console.log([latitude, longitude]);
            });

    }, []);

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data);
        })
    });

    useEffect(() => {
        axios.get<IBGEUFRes[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(
            res => {
                const ufInitials = res.data.map(uf => uf.sigla);
                setUfs(ufInitials);
            });
    }, [selectedUf]);

    useEffect(() => {
        if(selectedUf ==='0'){
            return;
        }

        axios
        .get<IBGECityRes[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(
            res => {
                const cityNames = res.data.map(city => city.nome);
                setCities(cityNames);
            });
    }, [handleSelectUf]);



    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    };

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    };

    function handleMapClik(event: LeafletMouseEvent){
        setSelectPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    };

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({...formData, [name]: value});
    };

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectItems(filteredItems);
        }else{
            setSelectItems([ ...selectedItems, id]);
        }
    };

    async function handleSubmit(event: FormEvent){
        event.preventDefault();
        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name, 
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        await api.post('points', data);
        alert('Ponto de coleta criado');
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={ logo } alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form>
                <h1>Cadastro do Ponto de Coleta</h1>
                <fieldset>
                    <legend>
                        <h2>
                            Dados
                        </h2>
                    </legend>
                    <div className="field"> 
                        <label htmlFor="name">Nome da Entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field"> 
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field"> 
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>
                            Endereço
                        </h2>
                        <span>Selecione o endereço de coleta</span>
                    </legend>
                    
                    <Map center={initialPosition} zoom={14} onClick={handleMapClik}>
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} zoom={14} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf}
                                onChange={handleSelectUf}>

                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}

                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}>

                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>
                            Itens de Coleta
                        </h2>
                        <span>Selecione um ou mais itens de coleta</span>
                    </legend>
                    <ul className="items-grid">
                        { items.map(item => (
                            
                            <li 
                            key={item.id} 
                            onClick={()=> handleSelectItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' :''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                               
                        ))}

                       
                    </ul>
                </fieldset>

                <button type="submit" onClick={handleSubmit}>
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
        );
}

export default CreatePoint;