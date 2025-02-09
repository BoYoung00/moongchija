"use client";

import React, { useEffect, useState } from "react";
import styles from "./Appointments.module.scss";
import { useRouter } from 'next/navigation';
import { SlMagnifier } from "react-icons/sl";
import TabMenu from "../../../components/tabMenu/TabMenu";
import AppointmentList from "./components/AppointmentList";
import CircleButton from "@/components/circleButton/CircleButton";
import Link from "next/link";
import Modal from "@/components/modal/Modal";
import InputField from "@/components/input-filed/InputFiled";
import Button from "@/components/button/Button";
import IconHeader from "@/components/header/IconHeader";
import Loading from "@/components/loading/Loading";
import { calculateCountdown } from "@/utils/dateUtils/dateUtils";
import { AppointmentCardDto } from "@/application/usecases/appointment/dto/AppointmentCardDto";
import { useUser } from "@/context/UserContext";

const tabs = ["투표 진행중", "약속 리스트"];

const AppointmentsPage: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(true);

  const [appointments, setAppointments] = useState<AppointmentCardDto[]>([]);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("전체");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 투표중인 약속 데이터
  const inProgressAppointments = appointments.filter(
    (appointment) => appointment.status === 'voting'
  );

  // 확정된 약속 데이터
  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === 'confirmed'
  );

  const handleTabChange = (index: number) => {
    setCurrentTab(index);
  };

  const handleCircleButtonClick = () => {
    setShowButtons((prev) => !prev);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  // 검색
  const filteredAppointments = (appointments: AppointmentCardDto[]) => {
    return appointments
      .filter((appointment) => {
        if (selectedOption === "방장" && !appointment.isCreator) {
          return false;
        }
        if (
          selectedOption === "예정" &&
          !calculateCountdown(appointment.confirmDate!).includes("D-")
        ) {
          return false;
        }
        if (
          selectedOption === "종료" &&
          calculateCountdown(appointment.confirmDate!) !== "종료"
        ) {
          return false;
        }
        return true;
      })
      .filter((appointment) => {
        return appointment.title
          .toLowerCase()
          .includes(searchText.toLowerCase());
      });
  };

  const fetchAppointments =  async() => {
    try {
      const response = await fetch(`/api/user/appointments?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const appointments: AppointmentCardDto[] = await response.json();

      const parseAppointments: AppointmentCardDto[] = appointments.map((appointment) => ({
        ...appointment,
        startDate: appointment.startDate ? new Date(appointment.startDate) : undefined,
        endDate: appointment.endDate ? new Date(appointment.endDate) : undefined,
        confirmDate: appointment.confirmDate ? new Date(appointment.confirmDate) : undefined,
      }));

      setAppointments(parseAppointments);
      
    } catch (error) {
      alert(`❌오류가 발생했습니다. :, ${error}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user])

  return (
    <>
      <IconHeader />
      <TabMenu tabs={tabs} onTabChange={handleTabChange} />
      <main className={styles.container}>
        <section className={styles.searchBox}>
          <select onChange={handleSelectChange} value={selectedOption}>
            <option value="전체">전체</option>
            <option value="방장">내가 방장인 약속</option>
            {currentTab === 1 && (
              <>
                <option value="예정">예정된 약속</option>
                <option value="종료">종료된 약속</option>
              </>
            )}
          </select>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="방 제목을 입력하세요."
            />
            <SlMagnifier />
          </div>
        </section>

        <section className={styles.listBox}>
          {loading && <Loading />}
          {/* 투표중 약속 */}
          {!loading && currentTab === 0 && (
            <AppointmentList
              appointments={filteredAppointments(inProgressAppointments)}
            />
          )}
          {/* 확정된 약속 */}
          {!loading && currentTab === 1 && (
            <AppointmentList
              appointments={filteredAppointments(confirmedAppointments)}
            />
          )}
        </section>

        {/* 하단 + 버튼 */}
        <CircleButton onClick={handleCircleButtonClick} />
        <section
          className={`${styles.buttonBox} ${showButtons ? styles.show : ""}`}
          onClick={handleCircleButtonClick}
        >
          <Link href={"/user/appointments/create"}>
            약속 만들기
          </Link>
          <button onClick={openModal}>방번호로 참여</button>
        </section>
      </main>

      {/* 모달 */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
          <EntryAppointmentModal />
      </Modal>
    </>
  );
};

export default AppointmentsPage;

const EntryAppointmentModal:React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [appointmentId, setAppointmentId] = useState<string>("");

  const handleRoomNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentId(e.target.value);
    console.log(appointmentId);
  };

  const fetchCheckAppointmentEntry = async () => {
    try {  
      const response = await fetch(`/api/user/check-appointment-entry?appointmentId=${appointmentId}&userId=${user?.id}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "방 입장 여부 확인에 실패했습니다.");
      }
  
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        alert(data.error);
      }
  
    } catch (error: any) {
      alert(`${error.message}`);
    }
  };
  

  return (
    <div className={styles.roomEntryBox}>
      <InputField
        label="방 번호"
        value={appointmentId}
        onChange={handleRoomNumberChange}
        type="text"
      />
    <Button size="sm" text="참여" onClick={fetchCheckAppointmentEntry} />
  </div>
  )
}