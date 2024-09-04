import { FormEvent, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { socket } from '@/common/lib/socket';
import { useSetRoomId } from '@/common/recoil/room';
import { useModal } from '@/modules/modal';

import NotFoundModal from '../modals/NotFound';


const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();

  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const router = useRouter();

  useEffect(() => {
    // document.body.style.background = 'linear-gradient(315deg, rgba(255,26,69,0.711922268907563) 0%, rgba(245,87,85,1) 11%';
    // backgroundPosition: 'center'
    document.body.style.width = '100%'; // Sets the width to 100% of the viewport width
    document.body.style.backgroundSize = 'cover'; // Ensure the image covers the entire viewport
    document.body.style.backgroundPosition = 'center'; // Center the image
    document.body.style.backgroundRepeat = 'no-repeat'; // Prevent repeating the image
    document.body.style.backgroundAttachment = 'fixed'; // Fixes the background image in place
    
    document.body.style.backgroundImage = `url('/bgimg.jpg')`;


  }, []);

  useEffect(() => {
    socket.on('created', (roomIdFromServer) => {
      setAtomRoomId(roomIdFromServer);
      router.push(roomIdFromServer);
    });

    const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
      if (!failed) {
        setAtomRoomId(roomIdFromServer);
        router.push(roomIdFromServer);
      } else {
        openModal(<NotFoundModal id={roomId} />);
      }
    };

    socket.on('joined', handleJoinedRoom);

    return () => {
      socket.off('created');
      socket.off('joined', handleJoinedRoom);
    };
  }, [openModal, roomId, router, setAtomRoomId]);

  useEffect(() => {
    socket.emit('leave_room');
    setAtomRoomId('');
  }, [setAtomRoomId]);

  const handleCreateRoom = () => {
    alert("You are redirected to a newly created room")
    socket.emit('create_room', username);
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // prompt("A room is created")
    if (roomId) socket.emit('join_room', roomId, username);
  };

  return (
    <div className="flex flex-col items-center py-24">
      <h1 className="text-5xl font-extrabold leading-tight sm:text-extra">
      Finger Canvas
      </h1>
      <h3 className="text-xl sm:text-2xl">Virtual Drawing Board</h3>

      <div className="mt-10 flex flex-col gap-2">
        <label className="self-start font-bold leading-tight">
          Enter your name
        </label>
        <input
          className="input"
          id="room-id"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value.slice(0, 15))}
        />
      </div>

      <div className="my-2" />

      <form
        className="flex flex-col items-center gap-3"
        onSubmit={handleJoinRoom}
      >
        <label htmlFor="room-id" className="self-start font-bold leading-tight">
          Enter room id
        </label>
        <input
          className="input"
          id="room-id"
          placeholder="Room id..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button className="btn" type="submit">
          Join
        </button>
      </form>

      <div className="my-8 flex w-96 items-center gap-2">
        <div className="h-px w-full bg-zinc-200" />
        <p className="text-zinc-400">or</p>
        <div className="h-px w-full bg-zinc-200" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <h5 className="self-start font-bold leading-tight">Create new room</h5>

        <button className="btn" onClick={handleCreateRoom}>
          Create
        </button>
      </div>
    </div>
  );
};

export default Home;
