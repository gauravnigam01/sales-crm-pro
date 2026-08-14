import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import {
  getAllDeals,
  updateDealStage,
} from "../services/dealService";

import "../styles/Pipeline.css";

function Pipeline() {

  const [deals, setDeals] = useState([]);

  const stages = [
    "New",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
  ];

  const loadDeals = async () => {
    try {
      const res = await getAllDeals();
      setDeals(res.deals || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    (async () => {
      await loadDeals();
    })();
  }, []);

  const onDragEnd = async (result) => {

    if (!result.destination) return;

    const sourceStage =
      result.source.droppableId;

    const destinationStage =
      result.destination.droppableId;

    if (sourceStage === destinationStage)
      return;

    const stageDeals =
      deals.filter(
        (d) => d.stage === sourceStage
      );

    const deal =
      stageDeals[result.source.index];

    if (!deal) return;

    try {

      await updateDealStage(
        deal._id,
        destinationStage
      );

      setDeals((prev) =>
        prev.map((item) =>
          item._id === deal._id
            ? {
                ...item,
                stage: destinationStage,
              }
            : item
        )
      );

    } catch (err) {

      console.log(err);

      toast.error("Stage Update Failed");

    }

  };

  return (

    <div className="pipeline-page">

      <h1>Sales Pipeline</h1>

      <DragDropContext
        onDragEnd={onDragEnd}
      >

        <div className="pipeline-board">

          {stages.map((stage) => (

            <Droppable
              droppableId={stage}
              key={stage}
            >

              {(provided) => (

                <div
                  className="pipeline-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >

                  <div className="pipeline-header">

                    <h3>{stage}</h3>

                    <span>

                      {
                        deals.filter(
                          (d) =>
                            d.stage === stage
                        ).length
                      }

                    </span>

                  </div>

                  <div className="pipeline-body">

                    {deals
                      .filter(
                        (deal) =>
                          deal.stage === stage
                      )
                      .map(
                        (
                          deal,
                          index
                        ) => (

                          <Draggable
                            key={deal._id}
                            draggableId={deal._id}
                            index={index}
                          >

                            {(provided) => (

                              <div
                                className="deal-card"
                                ref={
                                  provided.innerRef
                                }
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >

                                <h4>
                                  {deal.title}
                                </h4>

                                <p>
                                  👤{" "}
                                  {deal.customer
                                    ?.customerName ||
                                    "N/A"}
                                </p>

                                <h5>
                                  ₹
                                  {(
                                    deal.amount ||
                                    0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </h5>

                                <small>
                                  Probability :
                                  {deal.probability}%
                                </small>

                              </div>

                            )}

                          </Draggable>

                        )
                      )}

                    {provided.placeholder}

                  </div>

                </div>

              )}

            </Droppable>

          ))}

        </div>

      </DragDropContext>

    </div>

  );

}

export default Pipeline;