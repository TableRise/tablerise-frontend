'use client';

import { useState, useEffect, useCallback } from 'react';
import { socket } from '@/socket';
import { Rnd } from 'react-rnd';
import '@/app/match/styles/Match.css';
import newUUID from '@/utils/newUUID';

export function ConnectionState({ isConnected }: any): any {
    return <p>State: {'' + isConnected}</p>;
}

export function ConnectionManager() {
    function connect() {
        socket.connect();
    }

    function disconnect() {
        socket.disconnect();
    }

    return (
        <>
            <button onClick={connect}>Connect</button>
            <button onClick={disconnect}>Disconnect</button>
        </>
    );
}

export default function Match() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [matchId, setMatchId] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [avatarId, setAvatarId] = useState('Avatar');
    const [avatars, setAvatars] = useState<any[]>([]);
    const [userId, setUserId] = useState('');
    const [bgImg, setBgImg] = useState('');

    const onConnect = useCallback(() => {
        setIsConnected(true);
    }, []);

    const onDisconnect = useCallback(() => {
        setAvatars([]);
        setIsConnected(false);
    }, []);

    const onJoinRoom = useCallback((matchData: any) => {
        const { avatars, matchId } = matchData
        console.log('matchData', matchData)
        setAvatars(avatars);
        setMatchId(matchId);
    }, []);


    
    const onRoomNotFound = useCallback((value: string) => {
        setMatchId(value);
    }, []);

    const onCreatedBox = useCallback((value: any) => {
        console.log('onCreatedBox', value)
        setAvatars((previous) => [...previous, value]);
    }, []);

    const onAvatarMoved = useCallback((x: any, y: any, avatarId: any) => {
        console.log('onAvatarMoved')
        const avatarsList = [...avatars];
        
        const avatarIndex = avatarsList.findIndex((avatar) => avatar.avatarId === avatarId);
        
        avatarsList[avatarIndex].position.x = x;
        avatarsList[avatarIndex].position.y = y;

        setAvatars(avatarsList);
    }, [avatars]);

    const onBoxResized = useCallback((size: any, avatarId: any) => {
        console.log('onBoxResized')
        const avatarsList = [...avatars];

        const avatarIndex = avatarsList.findIndex((avatar) => avatar.avatarId === avatarId);

        avatarsList[avatarIndex].size.width = size.width;
        avatarsList[avatarIndex].size.height = size.height;

        setAvatars(avatarsList);
    }, [avatars]);

    const onBoxDeleted = useCallback((avatarId: any) => {
        const avatarsList = [...avatars];
        const newAvatars = avatarsList.filter((avatar) => avatar.avatarId !== avatarId);
        setAvatars(newAvatars);
    }, [avatars]);

    const onUploadPicture = useCallback((avatarId: any, imageLink: any) => {
        const avatarsList = [...avatars];

        const avatarIndex = avatarsList.findIndex((avatar) => avatar.avatarId === avatarId);

        avatarsList[avatarIndex].picture = imageLink;

        setAvatars(avatarsList);
    }, [avatars]);

    const onChangeBg = useCallback((imageLink: any) => {
        console.log('onChangeBg')
        setBgImg(imageLink);
    }, []);

    useEffect(() => {
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('joined-in-match', onJoinRoom);
        socket.on('Room not found', onRoomNotFound);
        socket.on('avatar-added-to-the-match', onCreatedBox);
        socket.on('Avatar Moved', onAvatarMoved);
        socket.on('Box Resized', onBoxResized);
        socket.on('box-deleted', onBoxDeleted);
        socket.on('avatar-picture-uploaded', onUploadPicture);
        socket.on('match-background-changed', onChangeBg);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('joined-in-match', onJoinRoom);
            socket.off('Room not found', onRoomNotFound);
            socket.off('avatar-added-to-the-match', onCreatedBox);
            socket.off('Avatar Moved', onAvatarMoved);
            socket.off('Box Resized', onBoxResized);
            socket.off('box-deleted', onBoxDeleted);
            socket.off('avatar-picture-uploaded', onUploadPicture);
            socket.off('match-background-changed', onChangeBg);
        };
    }, [
        avatars,
        onConnect,
        onDisconnect,
        onJoinRoom,
        onRoomNotFound,
        onCreatedBox,
        onAvatarMoved,
        onBoxResized,
        onBoxDeleted,
        onUploadPicture,
        onChangeBg
    ]);

    function handleJoinRoom(event: any) {
        event.preventDefault();

        // como as configurações do user vão ser feitas no projeto original, n é necessário gastar tempo com isso agora
        // é necessário enviar o user pq o back usa
        setUserId('1d4e4236-2389-418d-9aa2-b7c1c40b8bd3');
        socket.timeout(5000).emit('join', campaignId, '1d4e4236-2389-418d-9aa2-b7c1c40b8bd3', () => {}, );
    }
    const handleCreateAvatar = (event: any) => {
        event.preventDefault();
        socket.timeout(5000).emit(
            'create-avatar', {
                matchId,
                userId,
                campaignId,
                avatarId: undefined,
            }
        );
    };

    const handleStopMovement = (avatar: any, _e: any, ui: any) => {
        // tirei a regra pra facilitar a minha vida, mas a regra tá certa, e quando fizer no oficial vou usar ela 
        // if (avatar.userId === userId) {
        if (true) {
            console.log("handleStopMovement")
            onAvatarMoved(ui.x, ui.y, avatar.avatarId);
            socket.timeout(5000).emit('move-avatar', { 
                matchId,
                avatarId: avatar.avatarId,
                coordinates: { x: ui.x, y: ui.y },
                userId,
                socketId: socket.id
            })
        }
    }

    const handleResizeStop = (avatar: any, _e: any, ref: any) => {
        console.log('handleResizeStop')
        if (true) {
            console.log(ref.style)
            onBoxResized(ref.style, avatar.avatarId);
            socket.emit('resize-avatar', matchId, avatar.avatarId, { width: ref.style.width, height: ref.style.height }, socket.id);
        }
    }

    const handleDeleteAvatar = (avatar: any) => {
        console.log('handleDeleteAvatar', avatar)
        if (avatar.userId !== userId) return;
        socket.emit('delete-avatar', {
            matchId, 
            avatarId: avatar.avatarId
        });
    }

    const handleUpload = (avatar: any) => {
        console.log('handleUpload', avatar)
        const imageLink = 'any'
        if (true)
            socket.emit('set-picture', matchId, avatar.avatarId, imageLink );
    }

    const handleChangeBackground = () => {
        console.log('handleChangeBackground')
        // aqui precisa integrar a parte de mandar o arquivo
        // essa opção deve ser habilitada apenas para o mestre
        socket.emit('change-map-image', {
            matchId,
            mapId: '123'
        });
    }

    return (
        <section className="match-page">
            <div className="match-items">
                <form onSubmit={handleJoinRoom}>
                    <input onChange={(e) => setCampaignId(e.target.value)} placeholder="insira o id da sala" />
                    <button type="submit">Entrar na sala</button>
                </form>
                <form onSubmit={handleCreateAvatar}>
                    <input
                        onChange={(e) => setAvatarId(e.target.value)}
                        placeholder="Nome do personagem"
                        value={avatarId}
                    />

                    <button type="submit">Criar Avatar</button>
                </form>
                <button
                    type="button"
                    onClick={handleChangeBackground}
                >
                    Mudar background
                </button>
            </div>

            <div className="App">
                {userId && <span>{userId}</span>}
                <ConnectionState isConnected={isConnected} />
                <ConnectionManager />
            </div>

            <div>
                <p>{matchId}</p>
            </div>

            <div
                className="match-map"
                style={{
                    backgroundImage: `url(${bgImg})`,
                    backgroundSize: 'cover'
                }}
            >
                {avatars.map((avatar, index) => {
                    return (
                        <Rnd
                            size={{ width: avatar.size.width, height: avatar.size.height }}
                            position={{ x: avatar.position.x, y: avatar.position.y }}
                            default={{ x: avatar.position.x, y: avatar.position.y, width: avatar.size.width, height: avatar.size.height  }}
                            onDragStop={(e, ui) => handleStopMovement(avatar, e, ui)}
                            onResizeStop={(e, _direction, ref, _delta, _position) => handleResizeStop(avatar, e, ref)}
                            bounds="parent"
                            style={{
                                backgroundImage: `url(${avatar.picture})`,
                                backgroundSize: 'cover'
                            }}
                        >
                            <div className="avatar">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteAvatar(avatar)}
                                >
                                    X
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUpload(avatar)}
                                >
                                    UP
                                </button>
                                <p>
                                    {avatar.avatarName} - {index}
                                </p>
                            </div>
                        </Rnd>
                    )
                })}


            </div>
        </section>
    );
}