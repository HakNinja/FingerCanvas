import { FormEvent, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { socket } from '@/common/lib/socket';
import { useSetRoomId } from '@/common/recoil/room';
import NotFoundModal from '@/modules/home/modals/NotFound';
import { useModal } from '@/modules/modal';

const NameInput = () => {
  const setRoomId = useSetRoomId();
  const { openModal } = useModal();

  const [name, setName] = useState('');

  const router = useRouter();
  const roomId = (router.query.roomId || '').toString();

  useEffect(() => {
    if (!roomId) return;

    socket.emit('check_room', roomId);

    socket.on('room_exists', (exists) => {
      if (!exists) {
        router.push('/');
      }
    });

    // eslint-disable-next-line consistent-return
    return () => {
      socket.off('room_exists');
    };
  }, [roomId, router]);



  useEffect(() => {
    // document.body.style.background = 'linear-gradient(315deg, rgba(255,26,69,0.711922268907563) 0%, rgba(245,87,85,1) 11%';
    document.body.style.backgroundImage = `url('/bgimg.jpg')`;
    document.body.style.backgroundSize = 'cover'; // Ensures the image covers the entire viewport
    document.body.style.backgroundPosition = 'center'; // Centers the image
    document.body.style.backgroundRepeat = 'no-repeat'; // Prevents the image from repeating
    document.body.style.width = '100%'; // Sets the width to 100% (usually not necessary if you set background properties correctly)
    document.body.style.height = '100vh';
    document.body.style.textShadow = '1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white';




    const handleJoined = (roomIdFromServer: string, failed?: boolean) => {
      if (failed) {
        router.push('/');
        openModal(<NotFoundModal id={roomIdFromServer} />);
      } else setRoomId(roomIdFromServer);
    };

    socket.on('joined', handleJoined);

    return () => {
      socket.off('joined', handleJoined);
    };
  }, [openModal, router, setRoomId]);

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit('join_room', roomId, name);
  };

  return (
    <form
      className="my-24 flex flex-col items-center"
      onSubmit={handleJoinRoom}
    >
      <h1 className="text-5xl font-extrabold leading-tight sm:text-extra">
      Finger Canvas
      </h1>
      <h3 className="text-xl sm:text-2xl">Virtual Drawing Board</h3>

      <div className="mt-10 mb-3 flex flex-col gap-2">
        <label className="self-start font-bold leading-tight">
          Enter your name
        </label>
        <input
          className="rounded-xl border p-5 py-1"
          id="room-id"
          placeholder="Username..."
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 15))}
        />
      </div>

      <button className="btn" type="submit">
        Enter room
      </button>
    </form>
  );
};

export default NameInput;
