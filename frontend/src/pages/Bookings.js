import React, { useState, useEffect, useContext } from "react";
import Spinner from "../components/Spinner/Spinner";
import AuthContext from "../context/auth-context";
import BookingList from "../components/Bookings/BookingList/BookingList";
import BookingsChart from "../components/Bookings/BookingsChart/BookingsChart";
import BookingsControls from "../components/Bookings/BookingsControls/BookingsControls";
//changeOutputTypeHandler;

function BookingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [outputType, setOutputType] = useState("list");
  const context = useContext(AuthContext);

  const fetchBookings = () => {
    setIsLoading(true);

    const requestBody = {
      query: `
          query {
            bookings {
              _id
              createdAt
              event {
                _id
                title 
                date
                price
              }
            }
          }
        `,
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        const bookings = resData.data.bookings;
        setBookings(bookings);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const deleteBookingHandler = (bookingId) => {
    setIsLoading(true);
    const requestBody = {
      query: `
          mutation CancelBooking($id: ID!) {
            cancelBooking(bookingId: $id) {
              _id
              title
            }
          }
        `,
      variables: {
        id: bookingId,
      },
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        setBookings((bookings) => {
          const updatedBookings = bookings.filter((booking) => {
            return booking._id !== bookingId;
          });
          setIsLoading(false);
          return updatedBookings;
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  let changeOutputTypeHandler = (outputType) => {
    if (outputType === "list") {
      setOutputType("list");
    } else {
      setOutputType("chart");
    }
  };
  let content = <Spinner />;

  if (!isLoading) {
    content = (
      <React.Fragment>
        <BookingsControls
          activeOutputType={outputType}
          onChange={changeOutputTypeHandler}
        />
        <div>
          {outputType === "list" ? (
            <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
          ) : (
            <BookingsChart bookings={bookings} />
          )}
        </div>
      </React.Fragment>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}

export default BookingsPage;
