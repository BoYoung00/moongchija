"use client";

import styles from "./place.module.scss";
import Button from "@/components/button/Button";
import { useCreateAppointment } from "@/context/CreateAppointmentContext";
import { useEffect, useState } from "react";
import CircleIndicator from "./CircleIndicator";
import Loading from "@/components/loading/Loading";

const MAX_PLACES = 5;

interface Props {
  onPageChange: (index: number) => void;
}

const CreatePlace: React.FC<Props> = ({ onPageChange }) => {
  const { placeVotes, setPlaceVotes, createAppointment, loading } = useCreateAppointment();
  const [isButtonActive, setIsButtonActive] = useState(false);

  useEffect(() => {
    const allNamesFilled = placeVotes.every((place) => place.place.trim() !== "");
    setIsButtonActive(allNamesFilled);
  }, [placeVotes]);

  const handleAddPlace = () => {
    if (placeVotes.length < MAX_PLACES) {
      setPlaceVotes([...placeVotes, { place: "", place_url: "", appointment_id: null }]);
    }
  };

  const handleRemovePlace = () => {
    if (placeVotes.length > 1) {
      setPlaceVotes(placeVotes.slice(0, -1));
    }
  };

  const handleChange = (index: number, key: "place" | "place_url", value: string) => {
    const updatedPlaces = [...placeVotes];
    updatedPlaces[index][key] = value;
    setPlaceVotes(updatedPlaces);
  };

  const handleNextButton = async () => {
    await createAppointment();
    onPageChange(4);
  };

  return (
    <div className={styles.container}>
      <section className={styles.mainBox}>
        <div className={styles.indicatorWrapper}>
          <CircleIndicator total={3} activeIndexs={[0, 1, 2]} />
        </div>

        <p className={styles.title}>약속 장소 후보</p>

        <div className={styles.buttonWrapper}>
          <Button
            size="xs"
            text="+"
            onClick={handleAddPlace}
            color={"--grey-5-color"}
          />
          <Button
            size="xs"
            text="-"
            onClick={handleRemovePlace}
            color={"--grey-5-color"}
          />
        </div>

        <div className={styles.placeWrapper}>
          {placeVotes.map((place, index) => (
            <div key={index} className={styles.placeItem}>
              <label>장소 {index + 1}</label>
              <input
                type="text"
                value={place.place}
                onChange={(e) => handleChange(index, "place", e.target.value)}
                placeholder="장소명"
                disabled={loading}
              />
              <input
                className={styles.placeUrl}
                type="text"
                placeholder="장소 url (선택)"
                value={place.place_url}
                onChange={(e) => handleChange(index, "place_url", e.target.value)}
                disabled={loading}
              />
            </div>
          ))}
        </div>
      </section>
      
      <div className={styles.buttonWrapper}>
      <Button
        size="lg"
        text="약속 생성하기"
        active={isButtonActive && !loading}
        onClick={handleNextButton}
      />
      </ div>

      {loading && <Loading />}
    </div>
  );
};

export default CreatePlace;
